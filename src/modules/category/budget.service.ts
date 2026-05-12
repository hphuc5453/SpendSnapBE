import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Budget } from "./budget.schema";
import { Category } from "./category.schema";
import { Transactions } from "../transactions/transactions.schema";
import { UpsertBudgetDto } from "./dto/upsert-budget.dto";

@Injectable()
export class BudgetService {
    constructor(
        @InjectModel(Budget.name) private readonly budgetModel: Model<Budget>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
    ) { }

    async upsert(userId: string, dto: UpsertBudgetDto): Promise<Budget> {
        const userObjectId = new Types.ObjectId(userId);
        const categoryObjectId = new Types.ObjectId(dto.categoryId);

        const owns = await this.categoryModel.exists({ _id: categoryObjectId, userId: userObjectId });
        if (!owns) throw new NotFoundException('Category not found');

        const budget = await this.budgetModel.findOneAndUpdate(
            { userId: userObjectId, categoryId: categoryObjectId, yearMonth: dto.yearMonth },
            { $set: { amount: dto.amount } },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        );
        return budget!;
    }

    async listByMonth(userId: string, yearMonth: string) {
        const userObjectId = new Types.ObjectId(userId);
        const { start, end } = monthRange(yearMonth);

        const [budgets, spending] = await Promise.all([
            this.budgetModel
                .find({ userId: userObjectId, yearMonth })
                .populate('categoryId')
                .exec(),
            this.transactionsModel.aggregate<{ _id: Types.ObjectId; total: number }>([
                { $match: { userId: userObjectId, createdAt: { $gte: start, $lt: end } } },
                { $group: { _id: '$categoryId', total: { $sum: '$amount' } } },
            ]),
        ]);

        const spentByCategory = new Map(spending.map(s => [String(s._id), s.total]));

        return budgets.map(b => {
            const categoryRefId = (b.categoryId as any)?._id ?? b.categoryId;
            const spent = spentByCategory.get(String(categoryRefId)) ?? 0;
            return {
                _id: b._id,
                categoryId: b.categoryId,
                yearMonth: b.yearMonth,
                amount: b.amount,
                spent,
                remaining: Math.max(0, b.amount - spent),
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
}

function monthRange(yearMonth: string): { start: Date; end: Date } {
    const [yStr, mStr] = yearMonth.split('-');
    const year = Number(yStr);
    const monthIdx = Number(mStr) - 1;
    const start = new Date(Date.UTC(year, monthIdx, 1));
    const end = new Date(Date.UTC(year, monthIdx + 1, 1));
    return { start, end };
}
