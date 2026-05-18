import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { created, errorResponse, ok } from 'src/commons/swagger';

const USER_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f60',
    email: 'user@example.com',
    name: 'Phuc Le',
    avatar: null,
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register a new user', description: 'Creates a user and seeds the default categories.' })
    @ApiCreatedResponse(created(USER_EXAMPLE))
    @ApiResponse(errorResponse(401, 'Email already existed'))
    async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
        return this.authService.signUp(signUpDto);
    }

    @Post('/signin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign in with email + password', description: 'Returns a JWT access token and the user profile.' })
    @ApiOkResponse(ok({
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzFmMGQ1ZThmOWEzYjFjMmQ0ZTVmNjAifQ.signature',
        user: USER_EXAMPLE,
    }))
    @ApiResponse(errorResponse(401, 'Password is incorrect'))
    async signIn(@Body() signInDto: SignInDto): Promise<any> {
        return this.authService.signIn(signInDto);
    }

    @Post('/forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Request a password reset OTP',
        description: 'Sends a 6-digit OTP to the user\'s email (valid for 10 minutes). Always returns 200, regardless of whether the email exists, to avoid user-enumeration. Subject to a 60s resend cooldown per email.',
    })
    @ApiOkResponse(ok({ success: true }))
    @ApiResponse(errorResponse(400, 'Please wait a moment before requesting another code'))
    async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ success: true }> {
        await this.authService.forgotPassword(dto);
        return { success: true };
    }

    @Post('/reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Reset password using the OTP from email',
        description: 'Verifies the 6-digit OTP and sets the new password. Max 5 wrong attempts per OTP before it is invalidated.',
    })
    @ApiOkResponse(ok({ success: true }))
    @ApiResponse(errorResponse(400, 'Invalid or expired code'))
    async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ success: true }> {
        await this.authService.resetPassword(dto);
        return { success: true };
    }
}
