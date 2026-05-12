import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto {
    @ApiPropertyOptional({ example: 'Cà phê' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: 'coffee', description: 'Icon slug from GET /category/icons' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    icon?: string;

    @ApiPropertyOptional({ example: '#6F4E37' })
    @IsOptional()
    @IsString()
    color?: string;
}
