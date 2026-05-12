import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Category } from "../category/category.schema";
import { Budget } from "../category/budget.schema";
import { Transactions } from "../transactions/transactions.schema";

interface BreakdownItem {
    categoryId: string;
    name: string;
    icon: string;
    color?: string;
    kind: 'expense' | 'income';
    amount: number;
    percentage: number;
    amountLastMonth: number;
    changePercent: number | null;
}

interface Insight {
    categoryId: string;
    name: string;
    icon: string;
}

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
    ) { }

    async getOverview(userId: string, yearMonth?: string) {
        const ym = yearMonth ?? currentYearMonth();
        const ranges = computeRanges(ym);
        const userObjectId = new Types.ObjectId(userId);

        const [aggResult, categories, budgets] = await Promise.all([
            this.transactionsModel.aggregate([
                {
                    $match: {
                        userId: userObjectId,
                        createdAt: { $gte: ranges.lastMonthStart, $lt: ranges.nextMonthStart },
                    },
                },
                {
                    $facet: {
                        thisMonth: [
                            { $match: { createdAt: { $gte: ranges.thisMonthStart } } },
                            { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
                        ],
                        lastMonth: [
                            { $match: { createdAt: { $lt: ranges.thisMonthStart } } },
                            { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
                        ],
                    },
                },
            ]),
            this.categoryModel.find({ userId: userObjectId }).lean().exec(),
            this.budgetModel.find({ userId: userObjectId, yearMonth: ym }).lean().exec(),
        ]);

        const facet = aggResult[0] as { thisMonth: Array<{ _id: any; total: number }>; lastMonth: Array<{ _id: any; total: number }> } | undefined;
        const thisByCat = new Map<string, number>((facet?.thisMonth ?? []).map(r => [String(r._id), r.total]));
        const lastByCat = new Map<string, number>((facet?.lastMonth ?? []).map(r => [String(r._id), r.total]));

        let totalSpent = 0;
        let totalSpentLastMonth = 0;
        let totalIncome = 0;
        let totalIncomeLastMonth = 0;
        for (const cat of categories) {
            const idStr = String(cat._id);
            const cur = thisByCat.get(idStr) ?? 0;
            const prev = lastByCat.get(idStr) ?? 0;
            if (cat.kind === 'expense') {
                totalSpent += cur;
                totalSpentLastMonth += prev;
            } else {
                totalIncome += cur;
                totalIncomeLastMonth += prev;
            }
        }

        const breakdown: BreakdownItem[] = categories
            .filter(c => c.kind === 'expense')
            .map(c => {
                const idStr = String(c._id);
                const amount = thisByCat.get(idStr) ?? 0;
                const amountLast = lastByCat.get(idStr) ?? 0;
                return {
                    categoryId: idStr,
                    name: c.name,
                    icon: c.icon,
                    color: c.color,
                    kind: c.kind,
                    amount: round2(amount),
                    percentage: totalSpent > 0 ? round2((amount / totalSpent) * 100) : 0,
                    amountLastMonth: round2(amountLast),
                    changePercent: changePercent(amount, amountLast),
                };
            })
            .filter(b => b.amount > 0 || b.amountLastMonth > 0)
            .sort((a, b) => b.amount - a.amount);

        const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
        const remainingBudget = totalBudget - totalSpent;
        const daysLeft = daysLeftInMonth(ym);
        const safeToSpendPerDay = daysLeft > 0 ? round2(Math.max(0, remainingBudget) / daysLeft) : null;

        return {
            yearMonth: ym,
            totalSpent: round2(totalSpent),
            totalSpentLastMonth: round2(totalSpentLastMonth),
            spentChangePercent: changePercent(totalSpent, totalSpentLastMonth),
            totalIncome: round2(totalIncome),
            totalIncomeLastMonth: round2(totalIncomeLastMonth),
            incomeChangePercent: changePercent(totalIncome, totalIncomeLastMonth),
            totalBudget: round2(totalBudget),
            remainingBudget: round2(remainingBudget),
            safeToSpendPerDay,
            daysLeftInMonth: daysLeft,
            breakdown,
            insights: computeInsights(breakdown),
        };
    }
}

function currentYearMonth(): string {
    const d = new Date();
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function computeRanges(yearMonth: string) {
    const [y, m] = yearMonth.split('-').map(Number);
    const monthIdx = m - 1;
    return {
        thisMonthStart: new Date(Date.UTC(y, monthIdx, 1)),
        nextMonthStart: new Date(Date.UTC(y, monthIdx + 1, 1)),
        lastMonthStart: new Date(Date.UTC(y, monthIdx - 1, 1)),
    };
}

function daysLeftInMonth(yearMonth: string): number {
    const [y, m] = yearMonth.split('-').map(Number);
    const now = new Date();
    const currentY = now.getUTCFullYear();
    const currentM = now.getUTCMonth() + 1;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();

    if (y < currentY || (y === currentY && m < currentM)) return 0;
    if (y > currentY || (y === currentY && m > currentM)) return daysInMonth;
    return daysInMonth - now.getUTCDate() + 1;
}

function changePercent(curr: number, prev: number): number | null {
    if (prev === 0) return curr === 0 ? 0 : null;
    return round2(((curr - prev) / prev) * 100);
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

function computeInsights(breakdown: BreakdownItem[]) {
    const comparable = breakdown.filter(b => b.amountLastMonth > 0 && b.changePercent !== null);

    const improvements = comparable
        .filter(b => b.amount < b.amountLastMonth)
        .sort((a, b) => (a.changePercent ?? 0) - (b.changePercent ?? 0));
    const regressions = comparable
        .filter(b => b.amount > b.amountLastMonth)
        .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));

    const topImprovement = improvements[0]
        ? {
            ...pickInsightFields(improvements[0]),
            savedAmount: round2(improvements[0].amountLastMonth - improvements[0].amount),
            changePercent: improvements[0].changePercent,
        }
        : null;

    const topRegression = regressions[0]
        ? {
            ...pickInsightFields(regressions[0]),
            extraAmount: round2(regressions[0].amount - regressions[0].amountLastMonth),
            changePercent: regressions[0].changePercent,
        }
        : null;

    const topSpending = breakdown[0] && breakdown[0].amount > 0
        ? {
            ...pickInsightFields(breakdown[0]),
            amount: breakdown[0].amount,
            percentage: breakdown[0].percentage,
        }
        : null;

    return { topImprovement, topRegression, topSpending };
}

function pickInsightFields(b: BreakdownItem): Insight {
    return { categoryId: b.categoryId, name: b.name, icon: b.icon };
}
