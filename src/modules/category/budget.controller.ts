import { Body, Controller, Delete, Get, Param, Put, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { BudgetService } from "./budget.service";
import { UpsertBudgetDto } from "./dto/upsert-budget.dto";
import { errorResponse, ok } from "src/commons/swagger";

const BUDGET_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f90',
    userId: '671f0d5e8f9a3b1c2d4e5f60',
    categoryId: '671f0d5e8f9a3b1c2d4e5f80',
    yearMonth: '2026-05',
    amount: 5000000,
    currency: 'VND',
    createdAt: '2026-05-01T00:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
};

const BUDGET_WITH_SPENT_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f90',
    categoryId: {
        _id: '671f0d5e8f9a3b1c2d4e5f80',
        userId: '671f0d5e8f9a3b1c2d4e5f60',
        name: 'Coffee',
        kind: 'expense',
        icon: 'coffee',
        color: '#8B5A2B',
        isDefault: false,
    },
    yearMonth: '2026-05',
    amount: 5000000,
    currency: 'VND',
    originalAmount: 5000000,
    originalCurrency: 'VND',
    spent: 1200000,
    remaining: 3800000,
};

@ApiTags('Budget')
@Controller('budget')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class BudgetController {
    constructor(private readonly budgetService: BudgetService) { }

    @Put()
    @ApiOperation({
        summary: 'Upsert monthly budget for a category',
        description: 'Creates or updates the budget for the given (categoryId, yearMonth) pair.',
    })
    @ApiOkResponse(ok(BUDGET_EXAMPLE))
    @ApiResponse(errorResponse(404, 'Category not found'))
    async upsert(@Req() req: any, @Body() dto: UpsertBudgetDto): Promise<any> {
        return this.budgetService.upsert(req.user.sub, dto);
    }

    @Get()
    @ApiOperation({
        summary: 'List budgets for a given month with spent / remaining',
        description: '`yearMonth` defaults to the current UTC month if omitted. `spent` is summed from transactions in that month. All amounts are converted to the user\'s preferred `currency`; `originalAmount` / `originalCurrency` preserve the budget\'s value at creation time.',
    })
    @ApiQuery({ name: 'yearMonth', required: false, example: '2026-05', description: 'Year-month in YYYY-MM format' })
    @ApiOkResponse(ok([BUDGET_WITH_SPENT_EXAMPLE]))
    async list(@Req() req: any, @Query('yearMonth') yearMonth?: string): Promise<any[]> {
        const ym = yearMonth ?? currentYearMonth();
        return this.budgetService.listByMonth(req.user.sub, ym);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete a budget' })
    @ApiParam({ name: 'id', example: '671f0d5e8f9a3b1c2d4e5f90', description: 'Budget ObjectId' })
    @ApiOkResponse(ok({ success: true }))
    @ApiResponse(errorResponse(404, 'Budget not found'))
    async remove(@Req() req: any, @Param('id') id: string): Promise<{ success: true }> {
        await this.budgetService.remove(req.user.sub, id);
        return { success: true };
    }
}

function currentYearMonth(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}
