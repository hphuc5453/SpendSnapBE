import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from 'src/modules/user/user.schema';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOkResponse({
        type: User,
    })
    async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
        return this.authService.signUp(signUpDto);
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: User,
    })
    async signIn(@Body() signInDto: SignInDto): Promise<any> {
        return this.authService.signIn(signInDto);
    }
}
