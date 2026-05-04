import { Body, Controller, Get, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { User } from "./user.schema";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    constructor(private readonly userService: UserService, private readonly cloudinaryService: CloudinaryService) { }

    @Post('/create')
    async createUser(@Body() body: any): Promise<any> {
        return this.userService.create(body);
    }

    @Post('/updateAvatar')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'avatarFile', maxCount: 1 },
    ]))
    @ApiConsumes('multipart/form-data')
    async uploadAvatar(
        @Req() req: any,
        @UploadedFiles() files: { avatarFile?: Express.Multer.File[] }
    ) {
        // 1. Upload ảnh lên Cloudinary
        const file = files.avatarFile?.[0];
        const result = await this.cloudinaryService.uploadFile(file);

        // 2. Lấy Secure URL trả về từ Cloudinary
        const avatarUrl = result.secure_url;
        console.log('Link ảnh trên Cloudinary:', avatarUrl);

        // 3. Cập nhật link URL này vào MongoDB Atlas thông qua UserService
        return await this.userService.updateAvatar(req.user.sub, avatarUrl);
    }

    @Get('/profile')
    async getProfile(@Req() req: any): Promise<User | null> {
        return this.userService.getUserById(req.user.sub);
    }
}