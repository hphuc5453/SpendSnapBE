import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { YEAR_MONTH_REGEX } from "./constants";

@Schema({ collection: 'budgets', timestamps: true })
export class Budget extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop({ required: true, match: YEAR_MONTH_REGEX })
    yearMonth: string;
}

export const BudgetSchema = SchemaFactory.createForClass(Budget);
BudgetSchema.index({ userId: 1, categoryId: 1, yearMonth: 1 }, { unique: true });
BudgetSchema.index({ userId: 1, yearMonth: 1 });
