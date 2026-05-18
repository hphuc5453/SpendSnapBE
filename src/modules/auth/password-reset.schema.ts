import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ collection: 'password_resets', timestamps: true })
export class PasswordReset extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ required: true })
    otpHash: string;

    @Prop({ type: Number, default: 0 })
    attempts: number;

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ type: Boolean, default: false })
    consumed: boolean;
}

export const PasswordResetSchema = SchemaFactory.createForClass(PasswordReset);
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
