import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Transactions } from "./transactions.schema";
import { Category } from "../category/category.schema";
import { User } from "../user/user.schema";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { SocketGateway } from "../socket/socket.gateway";
import { ExchangeRateService } from "../currency/exchange-rate.service";
import type { CurrencyCode } from "../currency/constants";

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
        @InjectModel(Category.name) private readonly categoryModel: Model<Category>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly cloudinaryService: CloudinaryService,
        private readonly socketGateway: SocketGateway,
        private readonly exchangeRateService: ExchangeRateService,
    ) { }

    async create(userId: string, dto: CreateTransactionDto, image?: Express.Multer.File): Promise<Transactions> {
        const userObjectId = new Types.ObjectId(userId);
        const categoryObjectId = new Types.ObjectId(dto.categoryId);

        const owns = await this.categoryModel.exists({ _id: categoryObjectId, userId: userObjectId });
        if (!owns) throw new NotFoundException('Category not found');

        const userCurrency = await this.getUserCurrency(userObjectId);
        const currency: CurrencyCode = dto.currency ?? userCurrency;

        let imageUrl: string | undefined;
        if (image) {
            const uploadResult: any = await this.cloudinaryService.uploadFile(image);
            imageUrl = uploadResult.secure_url || uploadResult.url;
        }

        const newTransaction = new this.transactionsModel({
            userId: userObjectId,
            categoryId: categoryObjectId,
            amount: dto.amount,
            currency,
            imageUrl,
        });
        const saved = await newTransaction.save();
        await saved.populate('categoryId', 'name icon color kind');

        this.socketGateway.emitInvalidated(userId, ['transactions', 'statistics', 'categories']);

        return saved;
    }

    async getMyTransactions(userId: string): Promise<{
        transactions: any[];
        totalSpent: number;
        currency: CurrencyCode;
    }> {
        const userObjectId = new Types.ObjectId(userId);
        const displayCurrency = await this.getUserCurrency(userObjectId);

        const [transactions, rates] = await Promise.all([
            this.transactionsModel
                .find({ userId: userObjectId })
                .sort({ createdAt: -1 })
                .populate('categoryId', 'name icon color kind')
                .lean()
                .exec(),
            this.exchangeRateService.getRates(),
        ]);

        let totalSpent = 0;
        const converted = transactions.map(t => {
            const originalCurrency = this.exchangeRateService.normalizeCurrency((t as any).currency);
            const convertedAmount = this.exchangeRateService.convertWith(
                rates,
                t.amount,
                originalCurrency,
                displayCurrency,
            );

            if ((t.categoryId as any)?.kind === 'expense') {
                totalSpent += convertedAmount;
            }

            return {
                ...t,
                amount: round2(convertedAmount),
                currency: displayCurrency,
                originalAmount: t.amount,
                originalCurrency,
            };
        });

        return {
            transactions: converted,
            totalSpent: round2(totalSpent),
            currency: displayCurrency,
        };
    }

    private async getUserCurrency(userObjectId: Types.ObjectId): Promise<CurrencyCode> {
        const user = await this.userModel.findById(userObjectId, { currency: 1 }).lean();
        return this.exchangeRateService.normalizeCurrency(user?.currency);
    }
}

function round2(n: number): number {
    return Math.round(n * 100) / 100;
}
