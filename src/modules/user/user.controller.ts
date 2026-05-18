import { Body, Controller, Get, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from "./user.schema";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { created, errorResponse, ok } from "src/commons/swagger";
import { UpdateCurrencyDto } from "./dto/update-currency.dto";

const USER_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f60',
    email: 'user@example.com',
    name: 'Phuc Le',
    avatar: 'https://res.cloudinary.com/demo/image/upload/v1/avatar.jpg',
    currency: 'VND',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
};

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    constructor(private readonly userService: UserService, private readonly cloudinaryService: CloudinaryService) { }

    @Post('/create')
    @ApiOperation({ summary: 'Create a user (raw)', description: 'Low-level create — prefer /auth/signup for normal flows.' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                name: { type: 'string', example: 'Phuc Le' },
                password: { type: 'string', example: 'password123' },
            },
            required: ['email', 'name', 'password'],
        },
    })
    @ApiCreatedResponse(created(USER_EXAMPLE))
    async createUser(@Body() body: any): Promise<any> {
        return this.userService.create(body);
    }

    @Post('/updateAvatar')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatarFile', maxCount: 1 },
    ]))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Upload and set user avatar' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                avatarFile: { type: 'string', format: 'binary' },
            },
            required: ['avatarFile'],
        },
    })
    @ApiCreatedResponse(created(USER_EXAMPLE))
    @ApiResponse(errorResponse(401, 'Unauthorized'))
    async uploadAvatar(
        @Req() req: any,
        @UploadedFiles() files: { avatarFile?: Express.Multer.File[] }
    ) {
        const file = files.avatarFile?.[0];
        const result = await this.cloudinaryService.uploadFile(file);
        const avatarUrl = result.secure_url;
        console.log('Link ảnh trên Cloudinary:', avatarUrl);
        return await this.userService.updateAvatar(req.user.sub, avatarUrl);
    }

    @Get('/profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiOkResponse(ok(USER_EXAMPLE))
    @ApiResponse(errorResponse(401, 'Unauthorized'))
    async getProfile(@Req() req: any): Promise<User | null> {
        return this.userService.getUserById(req.user.sub);
    }

    @Patch('/currency')
    @ApiOperation({ summary: 'Update the current user\'s preferred currency' })
    @ApiOkResponse(ok({ ...USER_EXAMPLE, currency: 'USD' }))
    @ApiResponse(errorResponse(404, 'User not found'))
    async updateCurrency(
        @Req() req: any,
        @Body() dto: UpdateCurrencyDto,
    ): Promise<User> {
        return this.userService.updateCurrency(req.user.sub, dto.currency);
    }
}
