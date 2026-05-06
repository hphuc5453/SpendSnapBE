import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop()
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'CategoryType' })
    typeId: Types.ObjectId;

    @Prop({ default: 0 })
    limitBudget: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
