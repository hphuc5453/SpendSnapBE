import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Budget } from "./budget.schema";
import { Category } from "./category.schema";
import { Transactions } from "../transactions/transactions.schema";
import { User } from "../user/user.schema";
import { UpsertBudgetDto } from "./dto/upsert-budget.dto";
import { ExchangeRateService } from "../currency/exchange-rate.service";
import type { CurrencyCode } from "../currency/constants";

@Injectable()
export class BudgetService {
    constructor(
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly exchangeRateService: ExchangeRateService,
    ) { }

    async upsert(userId: string, dto: UpsertBudgetDto): Promise<Budget> {
        const userObjectId = new Types.ObjectId(userId);
        const categoryObjectId = new Types.ObjectId(dto.categoryId);

        const owns = await this.categoryModel.exists({ _id: categoryObjectId, userId: userObjectId });
        if (!owns) throw new NotFoundException('Category not found');

        const userCurrency = await this.getUserCurrency(userObjectId);
        const currency: CurrencyCode = dto.currency ?? userCurrency;

        const budget = await this.budgetModel.findOneAndUpdate(
            { userId: userObjectId, categoryId: categoryObjectId, yearMonth: dto.yearMonth },
            { $set: { amount: dto.amount, currency } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return budget!;
    }

    async listByMonth(userId: string, yearMonth: string) {
        const userObjectId = new Types.ObjectId(userId);
        const displayCurrency = await this.getUserCurrency(userObjectId);
        const { start, end } = monthRange(yearMonth);

        const [budgets, transactions] = await Promise.all([
            this.budgetModel
                .find({ userId: userObjectId, yearMonth })
                .populate('categoryId')
                .lean()
                .exec(),
            this.transactionsModel
                .find(
                    { userId: userObjectId, createdAt: { $gte: start, $lt: end } },
                    { amount: 1, currency: 1, categoryId: 1 },
                )
                .lean()
                .exec(),
        ]);

        const rates = await this.exchangeRateService.getRates();

        const spentByCategory = new Map<string, number>();
        for (const t of transactions) {
            if (!t.categoryId) continue;
            const fromCurrency = this.exchangeRateService.normalizeCurrency((t as any).currency);
            const converted = this.exchangeRateService.convertWith(
                rates,
                t.amount,
                fromCurrency,
                displayCurrency,
            );
            const key = String(t.categoryId);
            spentByCategory.set(key, (spentByCategory.get(key) ?? 0) + converted);
        }

        return budgets.map(b => {
            const categoryRefId = (b.categoryId as any)?._id ?? b.categoryId;
            const spent = spentByCategory.get(String(categoryRefId)) ?? 0;
            const budgetCurrency = this.exchangeRateService.normalizeCurrency((b as any).currency);
            const amountConverted = this.exchangeRateService.convertWith(
                rates,
                b.amount,
                budgetCurrency,
                displayCurrency,
            );
            return {
                _id: b._id,
                categoryId: b.categoryId,
                yearMonth: b.yearMonth,
                amount: round2(amountConverted),
                currency: displayCurrency,
                originalAmount: b.amount,
                originalCurrency: budgetCurrency,
                spent: round2(spent),
                remaining: round2(Math.max(0, amountConverted - spent)),
            };
        });
    }

    async remove(userId: string, budgetId: string): Promise<void> {
        const res = await this.budgetModel.deleteOne({
            _id: new Types.ObjectId(budgetId),
            userId: new Types.ObjectId(userId),
        });
        if (res.deletedCount === 0) throw new NotFoundException('Budget not found');
    }

    private async getUserCurrency(userObjectId: Types.ObjectId): Promise<CurrencyCode> {
        const user = await this.userModel.findById(userObjectId, { currency: 1 }).lean();
        return this.exchangeRateService.normalizeCurrency(user?.currency);
    }
}

function monthRange(yearMonth: string): { start: Date; end: Date } {
    const [yStr, mStr] = yearMonth.split('-');
    const year = Number(yStr);
    const monthIdx = Number(mStr) - 1;
    const start = new Date(Date.UTC(year, monthIdx, 1));
    const end = new Date(Date.UTC(year, monthIdx + 1, 1));
    return { start, end };
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
