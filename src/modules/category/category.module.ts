import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Category, CategorySchema } from "./category.schema";
import { CategoryType, CategoryTypeSchema } from "./category-type.schema";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Category.name, schema: CategorySchema },
            { name: CategoryType.name, schema: CategoryTypeSchema },
        ]),
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule { }
