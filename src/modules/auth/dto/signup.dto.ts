import { IsDefined, IsEmail, IsNotEmpty, IsString, MinLength, Validate } from "class-validator";

export class SignUpDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsDefined()
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    readonly email: string;

    @IsDefined()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;

}