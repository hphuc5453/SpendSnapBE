import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { CURRENCY_CODES, DEFAULT_CURRENCY } from "../currency/constants";
import type { CurrencyCode } from "../currency/constants";

@Schema({ collection: 'users', timestamps: true })
export class User extends Document {
    @Prop({ unique: true })
    email: string;

    @Prop()
    name: string;

    @Prop()
    password: string;

    @Prop()
    createdAt: Date;

    @Prop({ type: String, default: null })
    avatar: string | null

    @Prop({ type: String, enum: CURRENCY_CODES, default: DEFAULT_CURRENCY })
    currency: CurrencyCode;
}

export const UserSchema = SchemaFactory.createForClass(User);
