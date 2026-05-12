import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Category } from "./category.schema";
import { Transactions } from "../transactions/transactions.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { CATEGORY_ICONS, CATEGORY_TYPES, CategoryKind } from "./constants";

const DEFAULT_USER_CATEGORIES: ReadonlyArray<{ name: string; kind: CategoryKind; icon: string }> = [
    { name: 'Food & Drink', kind: 'expense', icon: 'food' },
    { name: 'Transportation', kind: 'expense', icon: 'transport' },
    { name: 'Shopping', kind: 'expense', icon: 'shopping' },
    { name: 'Entertainment', kind: 'expense', icon: 'entertainment' },
    { name: 'Health', kind: 'expense', icon: 'health' },
    { name: 'Bills & Utilities', kind: 'expense', icon: 'bills' },
    { name: 'Salary', kind: 'income', icon: 'salary' },
    { name: 'Freelance', kind: 'income', icon: 'freelance' },
];

@Injectable()
export class CategoryService {
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
    ) { }

    getCategoryTypes() {
        return CATEGORY_TYPES;
    }

    getCategoryIcons() {
        return CATEGORY_ICONS;
    }

    async seedDefaultCategories(userId: string): Promise<void> {
        const userObjectId = new Types.ObjectId(userId);
        const existing = await this.categoryModel
            .find({ userId: userObjectId }, { name: 1 })
            .lean()
            .exec();
        const existingNames = new Set(existing.map(c => c.name));

        const docs = DEFAULT_USER_CATEGORIES
            .filter(c => !existingNames.has(c.name))
            .map(c => ({
                userId: userObjectId,
                name: c.name,
                kind: c.kind,
                icon: c.icon,
                isDefault: true,
            }));

        if (docs.length) await this.categoryModel.insertMany(docs);
    }

    async addCategory(userId: string, dto: CreateCategoryDto): Promise<Category> {
        try {
            const newCategory = new this.categoryModel({
                userId: new Types.ObjectId(userId),
                name: dto.name,
                kind: dto.kind,
                icon: dto.icon,
                color: dto.color,
            });
            return await newCategory.save();
        } catch (err: any) {
            if (err?.code === 11000) {
                throw new ConflictException('Category name already exists');
            }
            throw err;
        }
    }

    async getUserCategories(userId: string): Promise<Array<Record<string, any> & { isMostUsed: boolean }>> {
        const userObjectId = new Types.ObjectId(userId);

        const [categories, topAgg] = await Promise.all([
            this.categoryModel
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .lean()
                .exec(),
            this.transactionsModel.aggregate<{ _id: Types.ObjectId; count: number }>([
                { $match: { userId: userObjectId, categoryId: { $ne: null } } },
                { $group: { _id: '$categoryId', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 1 },
            ]),
        ]);

        const topCategoryId = topAgg[0] ? String(topAgg[0]._id) : null;
        return categories.map(c => ({
            ...c,
            isMostUsed: topCategoryId !== null && String(c._id) === topCategoryId,
        }));
    }

    async updateCategory(userId: string, categoryId: string, dto: UpdateCategoryDto): Promise<Category> {
        try {
            const category = await this.categoryModel.findOneAndUpdate(
                { _id: new Types.ObjectId(categoryId), userId: new Types.ObjectId(userId) },
                { $set: { ...dto } },
                { new: true, runValidators: true },
            );
            if (!category) throw new NotFoundException('Category not found');
            return category;
        } catch (err: any) {
            if (err?.code === 11000) {
                throw new ConflictException('Category name already exists');
            }
            throw err;
        }
    }

    async deleteCategory(userId: string, categoryId: string): Promise<void> {
        const res = await this.categoryModel.deleteOne({
            _id: new Types.ObjectId(categoryId),
            userId: new Types.ObjectId(userId),
        });
        if (res.deletedCount === 0) throw new NotFoundException('Category not found');
    }
}