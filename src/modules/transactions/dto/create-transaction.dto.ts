import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsIn, IsMongoId, IsNumber, IsOptional, Min } from "class-validator";
import { CURRENCY_CODES } from "../../currency/constants";
import type { CurrencyCode } from "../../currency/constants";

export class CreateTransactionDto {
    @ApiProperty({ example: 50000, minimum: 0, description: 'Transaction amount' })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    readonly amount!: number;

    @ApiProperty({ example: '671f0d5e8f9a3b1c2d4e5f80', description: 'Category ObjectId owned by current user' })
    @IsMongoId()
    readonly categoryId!: string;

    @ApiPropertyOptional({
        example: 'VND',
        enum: CURRENCY_CODES,
        description: 'Currency of the transaction amount. Defaults to the user\'s preferred currency.',
    })
    @IsOptional()
    @IsIn(CURRENCY_CODES as unknown as string[])
    readonly currency?: CurrencyCode;
}
