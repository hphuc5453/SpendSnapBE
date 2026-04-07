import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Transactions, TransactionsSchema } from "./transactions.schema";
import { TransactionService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Transactions.name, schema: TransactionsSchema }]),
        CloudinaryModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionService],
})
export class TransactionsModule { }