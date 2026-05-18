import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsMongoId, IsNumber, IsOptional, IsString, Matches, Min } from "class-validator";
import { YEAR_MONTH_REGEX } from "../constants";
import { CURRENCY_CODES } from "../../currency/constants";
import type { CurrencyCode } from "../../currency/constants";

export class UpsertBudgetDto {
    @ApiProperty({ example: '671f0d5e8f9a3b1c2d4e5f60', description: 'Category ObjectId owned by current user' })
    @IsMongoId()
    readonly categoryId!: string;

    @ApiProperty({ example: '2026-05', description: 'Year-month in YYYY-MM format' })
    @IsString()
    @Matches(YEAR_MONTH_REGEX, { message: 'yearMonth must be in YYYY-MM format' })
    readonly yearMonth!: string;

    @ApiProperty({ example: 5000000, minimum: 0, description: 'Budget amount for that month' })
    @IsNumber()
    @Min(0)
    readonly amount!: number;

    @ApiPropertyOptional({
        example: 'VND',
        enum: CURRENCY_CODES,
        description: 'Currency of the budget amount. Defaults to the user\'s preferred currency.',
    })
    @IsOptional()
    @IsIn(CURRENCY_CODES as unknown as string[])
    readonly currency?: CurrencyCode;
}
