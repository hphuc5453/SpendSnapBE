import { IsDefined, IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateCategoryDto {
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsDefined()
    @IsString()
    readonly typeId: string;

    @IsDefined()
    @IsNumber()
    @Min(0)
    readonly limitBudget: number;
}
