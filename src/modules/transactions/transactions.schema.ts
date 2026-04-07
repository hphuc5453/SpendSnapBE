import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'transactions', timestamps: true })
export class Transactions extends Document {
    @Prop()
    userId: Types.ObjectId;

    @Prop()
    amount: number;

    @Prop()
    imageUrl: string;

    @Prop()
    category: string;

    @Prop()
    createdAt: Date;
}

export const TransactionsSchema = SchemaFactory.createForClass(Transactions);
