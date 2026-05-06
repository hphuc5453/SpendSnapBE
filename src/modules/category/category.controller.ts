import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@ApiTags('Category')
@Controller('category')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('/types')
    async getCategoryTypes(): Promise<any[]> {
        return this.categoryService.getCategoryTypes();
    }

    @Post('/create')
    async addCategory(
        @Req() req: any,
        @Body() dto: CreateCategoryDto,
    ): Promise<any> {
        return this.categoryService.addCategory(req.user.sub, dto);
    }

    @Get()
    async getUserCategories(@Req() req: any): Promise<any[]> {
        return this.categoryService.getUserCategories(req.user.sub);
    }

    @Patch('/:id')
    async updateCategory(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ): Promise<any> {
        return this.categoryService.updateCategory(req.user.sub, id, dto);
    }
}
