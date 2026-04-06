import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from "./user.schema";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async getAll(): Promise<User[]> {
        return this.userService.getAll();
    }

    @Post('/create')
    async createUser(@Body() body: any): Promise<any> {
        return this.userService.create(body);
    }
}