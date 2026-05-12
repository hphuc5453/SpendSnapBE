import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
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
}
