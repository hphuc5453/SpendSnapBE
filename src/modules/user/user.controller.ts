import { Body, Controller, Get, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiTags } from '@nestjs/swagger';
import { User } from "./user.schema";

@ApiTags('Users')
@Controller('users')
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