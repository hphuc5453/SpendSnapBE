import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'transactions', timestamps: true })
export class Transactions extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, min: 0 })
    amount: number;

    @Prop()
    imageUrl: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', index: true })
    categoryId: Types.ObjectId;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
