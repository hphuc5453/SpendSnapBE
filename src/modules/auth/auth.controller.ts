import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Response } from 'express';
import { User } from 'src/modules/user/user.schema';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup_dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { TokenInterceptor } from './interceptors/token.interceptor';
import type { SignInInterface } from './interface/signin.interface';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(TokenInterceptor)
    @ApiOkResponse({
        type: User,
    })
    async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
        // return this.authService.signUp(signUpDto);
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    @UseGuards(LocalAuthGuard)
    @UseInterceptors(TokenInterceptor)
    @ApiOkResponse({
        type: User,
    })
    async signIn(@Body() signInDto: SignInInterface): Promise<User | null> {
        return this.authService.signIn(signInDto);
    }
}
