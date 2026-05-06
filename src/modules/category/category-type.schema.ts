import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ collection: 'category_types', timestamps: true })
export class CategoryType extends Document {
    @Prop({ unique: true })
    slug: string;

    @Prop()
    label: string;

    @Prop()
    icon: string;
}

export const CategoryTypeSchema = SchemaFactory.createForClass(CategoryType);
