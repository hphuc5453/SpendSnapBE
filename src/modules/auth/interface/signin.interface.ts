import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SignInInterface {
    @ApiProperty({ example: `[EMAIL_ADDRESS]` })
    @IsString()
    readonly email: string;
    @ApiProperty({ example: `[PASSWORD]` })
    @IsString()
    readonly password: string;
}