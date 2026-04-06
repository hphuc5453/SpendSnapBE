import { Body, Controller, Get, Param, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from "./user.schema";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    constructor(private readonly userService: UserService, private readonly cloudinaryService: CloudinaryService) { }

    @Get()
    async getAll(): Promise<User[]> {
        return this.userService.getAll();
    }

    @Post('/create')
    async createUser(@Body() body: any): Promise<any> {
        return this.userService.create(body);
    }

    @Post(':id/avatar')
    @UseInterceptors(FileInterceptor('file')) // Tiếp nhận file với key là 'file'
    async uploadAvatar(
        @Param('id') userId: string,
        @UploadedFile() file: Express.Multer.File, // Lấy dữ liệu file
    ) {
        // 1. Upload ảnh lên Cloudinary
        const result = await this.cloudinaryService.uploadFile(file);

        // 2. Lấy Secure URL trả về từ Cloudinary
        const avatarUrl = result.secure_url;
        console.log('Link ảnh trên Cloudinary:', avatarUrl);

        // 3. Cập nhật link URL này vào MongoDB Atlas thông qua UserService
        return await this.userService.updateAvatar(userId, avatarUrl);
    }
}