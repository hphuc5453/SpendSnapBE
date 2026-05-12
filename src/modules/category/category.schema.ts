import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { CATEGORY_KINDS } from "./constants";
import type { CategoryKind } from "./constants";

@Schema({ collection: 'categories', timestamps: true })
export class Category extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true, enum: CATEGORY_KINDS })
    kind: CategoryKind;

    @Prop({ required: true })
    icon: string;

    @Prop()
    color?: string;

    @Prop({ default: false })
    isDefault: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
CategorySchema.index({ userId: 1, kind: 1 });
CategorySchema.index({ userId: 1, name: 1 }, { unique: true });
