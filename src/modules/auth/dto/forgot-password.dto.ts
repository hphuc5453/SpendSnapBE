import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty({ example: 'user@example.com', format: 'email' })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string;
}
