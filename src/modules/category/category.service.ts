import { Injectable, NotFoundException, OnApplicationBootstrap } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Category } from "./category.schema";
import { CategoryType } from "./category-type.schema";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

const DEFAULT_CATEGORY_TYPES = [
    { slug: 'food', label: 'Food & Drink', icon: '🍔' },
    { slug: 'transport', label: 'Transportation', icon: '🚗' },
    { slug: 'shopping', label: 'Shopping', icon: '🛍️' },
    { slug: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { slug: 'health', label: 'Health', icon: '💊' },
    { slug: 'bills', label: 'Bills & Utilities', icon: '🏠' },
    { slug: 'salary', label: 'Salary', icon: '💰' },
    { slug: 'freelance', label: 'Freelance', icon: '💻' },
];

@Injectable()
export class CategoryService implements OnApplicationBootstrap {
    constructor(
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(CategoryType.name) private readonly categoryTypeModel: Model<CategoryType>,
    ) { }

    async onApplicationBootstrap(): Promise<void> {
        for (const t of DEFAULT_CATEGORY_TYPES) {
            await this.categoryTypeModel.updateOne(
                { slug: t.slug },
                { $setOnInsert: t },
                { upsert: true },
            );
        }
    }

    async getCategoryTypes(): Promise<CategoryType[]> {
        return this.categoryTypeModel.find().sort({ createdAt: 1 }).exec();
    }

    async seedDefaultCategories(userId: string): Promise<void> {
        const types = await this.categoryTypeModel.find().exec();
        const docs = types.map(t => ({
            userId: new Types.ObjectId(userId),
            name: t.label,
            typeId: t._id,
            limitBudget: 0,
        }));
        await this.categoryModel.insertMany(docs);
    }

    async addCategory(userId: string, dto: CreateCategoryDto): Promise<Category> {
        const type = await this.categoryTypeModel.findById(new Types.ObjectId(dto.typeId)).exec();
        if (!type) throw new NotFoundException('Category type not found');

        const newCategory = new this.categoryModel({
            userId: new Types.ObjectId(userId),
            name: dto.name,
            typeId: type._id,
            limitBudget: dto.limitBudget,
        });
        return newCategory.save();
    }

    async getUserCategories(userId: string): Promise<Category[]> {
        return this.categoryModel
            .find({ userId: new Types.ObjectId(userId) })
            .populate('typeId')
            .sort({ createdAt: -1 })
            .exec();
    }

    async updateCategory(userId: string, categoryId: string, dto: UpdateCategoryDto): Promise<Category> {
        const category = await this.categoryModel.findOneAndUpdate(
            { _id: new Types.ObjectId(categoryId), userId: new Types.ObjectId(userId) },
            { $set: dto },
            { new: true, populate: 'typeId' },
        );
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }
}
