import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { StatisticsService } from "./statistics.service";
import { ok } from "src/commons/swagger";

const OVERVIEW_EXAMPLE = {
    yearMonth: '2026-05',
    totalSpent: 4280.50,
    totalSpentLastMonth: 3822.62,
    spentChangePercent: 12.0,
    totalIncome: 8000.00,
    totalIncomeLastMonth: 8000.00,
    incomeChangePercent: 0,
    totalBudget: 5000.00,
    remainingBudget: 719.50,
    safeToSpendPerDay: 45.00,
    daysLeftInMonth: 16,
    breakdown: [
        {
            categoryId: '671f0d5e8f9a3b1c2d4e5f80',
            name: 'Food & Drinks',
            icon: 'food',
            color: '#ABF600',
            kind: 'expense',
            amount: 1712.20,
            percentage: 40.0,
            amountLastMonth: 1672.0,
            changePercent: 2.4,
        },
        {
            categoryId: '671f0d5e8f9a3b1c2d4e5f81',
            name: 'Shopping',
            icon: 'shopping',
            color: '#FF6B35',
            kind: 'expense',
            amount: 1498.18,
            percentage: 35.0,
            amountLastMonth: 1294.0,
            changePercent: 15.8,
        },
        {
            categoryId: '671f0d5e8f9a3b1c2d4e5f82',
            name: 'Travel',
            icon: 'travel',
            color: '#FFD60A',
            kind: 'expense',
            amount: 1070.12,
            percentage: 25.0,
            amountLastMonth: 1520.0,
            changePercent: -29.6,
        },
    ],
    insights: {
        topImprovement: {
            categoryId: '671f0d5e8f9a3b1c2d4e5f82',
            name: 'Travel',
            icon: 'travel',
            savedAmount: 449.88,
            changePercent: -29.6,
        },
        topRegression: {
            categoryId: '671f0d5e8f9a3b1c2d4e5f81',
            name: 'Shopping',
            icon: 'shopping',
            extraAmount: 204.18,
            changePercent: 15.8,
        },
        topSpending: {
            categoryId: '671f0d5e8f9a3b1c2d4e5f80',
            name: 'Food & Drinks',
            icon: 'food',
            amount: 1712.20,
            percentage: 40.0,
        },
    },
};

@ApiTags('Statistics')
@Controller('statistics')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class StatisticsController {
    constructor(private readonly statisticsService: StatisticsService) { }

    @Get('/overview')
    @ApiOperation({
        summary: 'Monthly stats overview for the current user',
        description: 'Returns total spent, change vs last month, donut/breakdown by category, total/remaining budget, safe-to-spend-per-day, and insights (top improvement / regression / spending). `yearMonth` defaults to the current UTC month.',
    })
    @ApiQuery({ name: 'yearMonth', required: false, example: '2026-05', description: 'Year-month in YYYY-MM format' })
    @ApiOkResponse(ok(OVERVIEW_EXAMPLE))
    async getOverview(
        @Req() req: any,
        @Query('yearMonth') yearMonth?: string,
    ): Promise<any> {
        return this.statisticsService.getOverview(req.user.sub, yearMonth);
    }
}
