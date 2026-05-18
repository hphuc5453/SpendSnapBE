import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsString } from "class-validator";
import { CURRENCY_CODES } from "../../currency/constants";
import type { CurrencyCode } from "../../currency/constants";

export class UpdateCurrencyDto {
    @ApiProperty({
        example: 'VND',
        enum: CURRENCY_CODES,
        description: 'Currency code from GET /currency',
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(CURRENCY_CODES as unknown as string[])
    currency: CurrencyCode;
}
