import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { CategoryService } from "./category.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { created, errorResponse, ok } from "src/commons/swagger";

const CATEGORY_TYPE_EXAMPLE = [
    { slug: 'expense', label: 'Expense', icon: '💸' },
    { slug: 'income', label: 'Income', icon: '💵' },
];

const CATEGORY_ICON_EXAMPLE = [
    { slug: 'food', label: 'Food', icon: '🍔' },
    { slug: 'coffee', label: 'Coffee', icon: '☕' },
    { slug: 'transport', label: 'Transport', icon: '🚗' },
];

const CATEGORY_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f80',
    userId: '671f0d5e8f9a3b1c2d4e5f60',
    name: 'Coffee',
    kind: 'expense',
    icon: 'coffee',
    color: '#8B5A2B',
    isDefault: false,
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
};

@ApiTags('Category')
@Controller('category')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('/types')
    @ApiOperation({ summary: 'List available category kinds (expense/income)' })
    @ApiOkResponse(ok(CATEGORY_TYPE_EXAMPLE))
    getCategoryTypes(): any[] {
        return [...this.categoryService.getCategoryTypes()];
    }

    @Get('/icons')
    @ApiOperation({ summary: 'List available category icons' })
    @ApiOkResponse(ok(CATEGORY_ICON_EXAMPLE))
    getCategoryIcons(): any[] {
        return [...this.categoryService.getCategoryIcons()];
    }

    @Post('/create')
    @ApiOperation({ summary: 'Create a new category for the current user' })
    @ApiCreatedResponse(created(CATEGORY_EXAMPLE))
    @ApiResponse(errorResponse(409, 'Category name already exists'))
    async addCategory(
        @Req() req: any,
        @Body() dto: CreateCategoryDto,
    ): Promise<any> {
        return this.categoryService.addCategory(req.user.sub, dto);
    }

    @Get()
    @ApiOperation({
        summary: 'List the current user\'s categories',
        description: '`isMostUsed` = true for the category with the highest transaction count (all-time, single winner). False on all others if the user has no transactions yet.',
    })
    @ApiOkResponse(ok([
        { ...CATEGORY_EXAMPLE, isMostUsed: true },
        { ...CATEGORY_EXAMPLE, _id: '671f0d5e8f9a3b1c2d4e5f81', name: 'Travel', icon: 'travel', isMostUsed: false },
    ]))
    async getUserCategories(@Req() req: any): Promise<any[]> {
        return this.categoryService.getUserCategories(req.user.sub);
    }

    @Patch('/:id')
    @ApiOperation({ summary: 'Update a category (name / icon / color)' })
    @ApiParam({ name: 'id', example: '671f0d5e8f9a3b1c2d4e5f80', description: 'Category ObjectId' })
    @ApiOkResponse(ok({ ...CATEGORY_EXAMPLE, name: 'Cà phê' }))
    @ApiResponse(errorResponse(404, 'Category not found'))
    @ApiResponse(errorResponse(409, 'Category name already exists'))
    async updateCategory(
        @Req() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateCategoryDto,
    ): Promise<any> {
        return this.categoryService.updateCategory(req.user.sub, id, dto);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete a category' })
    @ApiParam({ name: 'id', example: '671f0d5e8f9a3b1c2d4e5f80', description: 'Category ObjectId' })
    @ApiOkResponse(ok({ success: true }))
    @ApiResponse(errorResponse(404, 'Category not found'))
    async deleteCategory(
        @Req() req: any,
        @Param('id') id: string,
    ): Promise<{ success: true }> {
        await this.categoryService.deleteCategory(req.user.sub, id);
        return { success: true };
    }
}
