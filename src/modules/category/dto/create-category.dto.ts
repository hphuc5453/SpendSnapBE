import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { CATEGORY_KINDS } from "../constants";
import type { CategoryKind } from "../constants";

export class CreateCategoryDto {
    @ApiProperty({ example: 'Coffee', description: 'Category display name (unique per user)' })
    @IsString()
    @IsNotEmpty()
    readonly name!: string;

    @ApiProperty({ enum: CATEGORY_KINDS, example: 'expense' })
    @IsIn(CATEGORY_KINDS as unknown as string[])
    readonly kind!: CategoryKind;

    @ApiProperty({ example: 'coffee', description: 'Icon slug from GET /category/icons' })
    @IsString()
    @IsNotEmpty()
    readonly icon!: string;

    @ApiPropertyOptional({ example: '#8B5A2B', description: 'Optional accent color (hex)' })
    @IsOptional()
    @IsString()
    readonly color?: string;
}
