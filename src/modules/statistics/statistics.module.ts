import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Transactions, TransactionsSchema } from "../transactions/transactions.schema";
import { Category, CategorySchema } from "../category/category.schema";
import { Budget, BudgetSchema } from "../category/budget.schema";
import { User, UserSchema } from "../user/user.schema";
import { StatisticsService } from "./statistics.service";
import { StatisticsController } from "./statistics.controller";
import { CurrencyModule } from "../currency/currency.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Transactions.name, schema: TransactionsSchema },
            { name: Category.name, schema: CategorySchema },
            { name: Budget.name, schema: BudgetSchema },
            { name: User.name, schema: UserSchema },
        ]),
        CurrencyModule,
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
})
export class StatisticsModule { }
