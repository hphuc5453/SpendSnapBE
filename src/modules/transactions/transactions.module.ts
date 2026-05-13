import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Transactions, TransactionsSchema } from "./transactions.schema";
import { Category, CategorySchema } from "../category/category.schema";
import { TransactionService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { SocketModule } from "../socket/socket.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transactions.name, schema: TransactionsSchema },
            { name: Category.name, schema: CategorySchema },
        ]),
        CloudinaryModule,
        SocketModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionService],
})
export class TransactionsModule { }
