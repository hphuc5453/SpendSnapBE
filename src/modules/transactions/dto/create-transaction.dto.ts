import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsMongoId, IsNumber, Min } from "class-validator";

export class CreateTransactionDto {
    @ApiProperty({ example: 50000, minimum: 0, description: 'Transaction amount' })
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    readonly amount!: number;

    @ApiProperty({ example: '671f0d5e8f9a3b1c2d4e5f80', description: 'Category ObjectId owned by current user' })
    @IsMongoId()
    readonly categoryId!: string;
}
