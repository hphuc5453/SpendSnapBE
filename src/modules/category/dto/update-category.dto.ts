import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    limitBudget?: number;
}
