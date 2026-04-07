import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Transactions } from "./transactions.schema";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Injectable()
export class TransactionService {
    constructor(
        @InjectModel(Transactions.name) private readonly transactionsModel: Model<Transactions>,
        private readonly cloudinaryService: CloudinaryService,
    ) { }
    async create(body: any, image: Express.Multer.File): Promise<any> {
        try {
            console.log('--- TransactionsService.create ---');
            console.log('Body:', body);
            console.log('Image details:', image ? image.originalname : 'No image provided');

            const { amount, userId } = body;
            
            console.log('Uploading image to Cloudinary...');
            const uploadResult: any = await this.cloudinaryService.uploadFile(image);
            console.log('Cloudinary response:', uploadResult.secure_url);
            
            const imageUrl = uploadResult.secure_url || uploadResult.url || String(uploadResult);

            console.log('Preparing to save transaction with userId:', userId, typeof userId);
            const newTransaction = new this.transactionsModel({
                amount,
                imageUrl,
                userId: new Types.ObjectId(userId),
            });
            
            console.log('Saving to database...');
            const result = await newTransaction.save();
            console.log('Transaction saved successfully.');
            return result;
        } catch (error) {
            console.error('Error in TransactionsService.create:', error);
            throw error;
        }
    }
}