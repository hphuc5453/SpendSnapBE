import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class SignUpDto {
    @ApiProperty({ example: 'Phuc Le', description: 'Display name' })
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    readonly name!: string;

    @ApiProperty({ example: 'user@example.com', format: 'email' })
    @IsDefined()
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email!: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password!: string;
}
