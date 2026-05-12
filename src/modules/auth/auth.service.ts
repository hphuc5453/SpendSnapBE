import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { User } from 'src/modules/user/user.schema';
import { AUTH_MESSAGES } from 'src/commons/strings';
import { SignInDto } from './dto/signin.dto';
import { SignUpDto } from './dto/signup.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private categoryService: CategoryService,
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
}
