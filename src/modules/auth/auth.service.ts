import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { SignInInterface } from './interface/signin.interface';
import { User } from 'src/modules/user/user.schema';
import { AUTH_MESSAGES } from 'src/commons/strings';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService) { }

    async signIn(signInDto: SignInInterface): Promise<User | null> {
        return this.validateUser(signInDto.email, signInDto.password);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        let user: (User | null)
        try {
            user = await this.userService.findOne({ email: email });
            if (!user) {
                throw new UnauthorizedException(
                    AUTH_MESSAGES.USER_NOT_FOUND
                )
            }
            if (user.password !== password) {
                throw new UnauthorizedException(
                    AUTH_MESSAGES.PASSWORD_INCORRECT
                )
            }
            return user;
        } catch (err) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.USER_NOT_FOUND
            )
        }
    }

    async verifyPayload(payload: JwtPayload): Promise<User | null> {
        let user: (User | null)
        try {
            user = await this.userService.findOne({ where: { email: payload.sub } });
        } catch (err) {
            throw new UnauthorizedException(
                AUTH_MESSAGES.USER_NOT_FOUND
            )
        }
        return user;
    }

    signToken(user: User): string {
        const payload = {
            sub: user.email,
        };

        return this.jwtService.sign(payload);
    }
}
