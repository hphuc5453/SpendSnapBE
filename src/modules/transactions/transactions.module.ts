import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Transactions, TransactionsSchema } from "./transactions.schema";
import { Category, CategorySchema } from "../category/category.schema";
import { User, UserSchema } from "../user/user.schema";
import { TransactionService } from "./transactions.service";
import { TransactionsController } from "./transactions.controller";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";
import { SocketModule } from "../socket/socket.module";
import { CurrencyModule } from "../currency/currency.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transactions.name, schema: TransactionsSchema },
            { name: Category.name, schema: CategorySchema },
            { name: User.name, schema: UserSchema },
        ]),
        CloudinaryModule,
        SocketModule,
        CurrencyModule,
    ],
    controllers: [TransactionsController],
    providers: [TransactionService],
})
export class TransactionsModule { }
