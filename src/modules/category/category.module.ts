import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./category.schema";
import { Budget, BudgetSchema } from "./budget.schema";
import { Transactions, TransactionsSchema } from "../transactions/transactions.schema";
import { User, UserSchema } from "../user/user.schema";
import { CategoryService } from "./category.service";
import { BudgetService } from "./budget.service";
import { CategoryController } from "./category.controller";
import { BudgetController } from "./budget.controller";
import { CurrencyModule } from "../currency/currency.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Category.name, schema: CategorySchema },
            { name: Budget.name, schema: BudgetSchema },
            { name: Transactions.name, schema: TransactionsSchema },
            { name: User.name, schema: UserSchema },
        ]),
        CurrencyModule,
    ],
    controllers: [CategoryController, BudgetController],
    providers: [CategoryService, BudgetService],
    exports: [CategoryService],
})
export class CategoryModule { }
