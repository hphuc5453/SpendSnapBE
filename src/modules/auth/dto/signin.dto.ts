import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @ApiProperty({ example: 'user@example.com', format: 'email' })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @IsNotEmpty()
    password!: string;
}
