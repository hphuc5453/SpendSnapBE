import { BadRequestException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/user.schema';
import { AUTH_MESSAGES } from 'src/commons/strings';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordReset } from './password-reset.schema';
import { CategoryService } from '../category/category.service';
import { MailService } from '../mail/mail.service';

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private categoryService: CategoryService,
        private mailService: MailService,
        @InjectModel(PasswordReset.name) private readonly passwordResetModel: Model<PasswordReset>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
    ) { }

    async signIn(signInDto: SignInDto): Promise<any> {
        let user: (User | null)
        user = await this.userService.getUserByEmail(signInDto.email);
        if (!user) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.USER_NOT_FOUND
            )
        }
        if (user.password !== signInDto.password) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.PASSWORD_INCORRECT
            )
        }

        const payload = {
            sub: user._id.toString(),
            email: user.email,
            name: user.name,
        }

        const accessToken = await this.jwtService.signAsync(payload);
        const { password, ...result } = user as any;
        return {
            accessToken,
            user: result
        };
    }

    async signUp(signUpDto: SignUpDto): Promise<any> {
        let user: (User | null)
        user = await this.userService.findByEmail(signUpDto.email);
        if (user) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.EMAIL_EXISTED
            )
        }
        const newUser = await this.userService.create(signUpDto);
        await this.categoryService.seedDefaultCategories(newUser._id.toString());
        const { password, ...result } = newUser.toJSON();
        return result;
    }

    async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            this.logger.log(`Password reset requested for unknown email (not revealed to client)`);
            return;
        }

        const recent = await this.passwordResetModel
            .findOne({ userId: user._id })
            .sort({ createdAt: -1 })
            .lean();
        if (recent && Date.now() - new Date((recent as any).createdAt).getTime() < OTP_RESEND_COOLDOWN_MS) {
            throw new BadRequestException(AUTH_MESSAGES.RESET_REQUEST_TOO_SOON);
        }

        await this.passwordResetModel.deleteMany({ userId: user._id, consumed: false });

        const otp = String(randomInt(0, 1_000_000)).padStart(6, '0');
        const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

        await this.passwordResetModel.create({
            userId: user._id,
            otpHash,
            attempts: 0,
            expiresAt,
            consumed: false,
        });

        await this.mailService.sendOtp(user.email, otp, OTP_TTL_MINUTES);
    }

    async resetPassword(dto: ResetPasswordDto): Promise<void> {
        const user = await this.userService.findByEmail(dto.email);
        if (!user) {
            throw new BadRequestException(AUTH_MESSAGES.INVALID_OTP);
        }

        const reset = await this.passwordResetModel
            .findOne({
                userId: user._id,
                consumed: false,
                expiresAt: { $gt: new Date() },
            })
            .sort({ createdAt: -1 });

        if (!reset) {
            throw new BadRequestException(AUTH_MESSAGES.INVALID_OTP);
        }

        if (reset.attempts >= OTP_MAX_ATTEMPTS) {
            reset.consumed = true;
            await reset.save();
            throw new BadRequestException(AUTH_MESSAGES.TOO_MANY_ATTEMPTS);
        }

        const valid = await bcrypt.compare(dto.otp, reset.otpHash);
        if (!valid) {
            reset.attempts += 1;
            await reset.save();
            throw new BadRequestException(AUTH_MESSAGES.INVALID_OTP);
        }

        await this.userModel.updateOne(
            { _id: user._id },
            { $set: { password: dto.newPassword } },
        );

        reset.consumed = true;
        await reset.save();
    }
}
