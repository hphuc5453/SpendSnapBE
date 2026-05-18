import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from "class-validator";

export class ResetPasswordDto {
    @ApiProperty({ example: 'user@example.com', format: 'email' })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string;

    @ApiProperty({ example: '123456', description: '6-digit OTP sent to the user\'s email' })
    @IsString()
    @Length(6, 6)
    @Matches(/^\d{6}$/, { message: 'otp must be exactly 6 digits' })
    readonly otp!: string;

    @ApiProperty({ example: 'newPassword123', minLength: 6 })
    @IsString()
    @MinLength(6)
    readonly newPassword!: string;
}
