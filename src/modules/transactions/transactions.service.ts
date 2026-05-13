import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Transactions } from "./transactions.schema";
import { Category } from "../category/category.schema";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { SocketGateway } from "../socket/socket.gateway";

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly socketGateway: SocketGateway,
    ) { }

    async create(userId: string, dto: CreateTransactionDto, image?: Express.Multer.File): Promise<Transactions> {
        const userObjectId = new Types.ObjectId(userId);
        const categoryObjectId = new Types.ObjectId(dto.categoryId);

        const owns = await this.categoryModel.exists({ _id: categoryObjectId, userId: userObjectId });
        if (!owns) throw new NotFoundException('Category not found');

        let imageUrl: string | undefined;
        if (image) {
            const uploadResult: any = await this.cloudinaryService.uploadFile(image);
            imageUrl = uploadResult.secure_url || uploadResult.url;
        }

        const newTransaction = new this.transactionsModel({
            userId: userObjectId,
            categoryId: categoryObjectId,
            amount: dto.amount,
            imageUrl,
        });
        const saved = await newTransaction.save();
        await saved.populate('categoryId', 'name icon color kind');

        this.socketGateway.emitInvalidated(userId, ['transactions', 'statistics', 'categories']);

        return saved;
    }

    async getMyTransactions(userId: string): Promise<{ transactions: Transactions[]; totalSpent: number }> {
        const userObjectId = new Types.ObjectId(userId);

        const expenseCategories = await this.categoryModel
            .find({ userId: userObjectId, kind: 'expense' }, { _id: 1 })
            .lean()
            .exec();
        const expenseIds = expenseCategories.map(c => c._id);

        const [transactions, sumResult] = await Promise.all([
            this.transactionsModel
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .populate('categoryId', 'name icon color kind')
                .exec(),
            this.transactionsModel.aggregate<{ _id: null; total: number }>([
                { $match: { userId: userObjectId, categoryId: { $in: expenseIds } } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        return {
            transactions,
            totalSpent: sumResult[0]?.total ?? 0,
        };
    }
}
