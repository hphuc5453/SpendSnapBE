import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

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
}

export const UserSchema = SchemaFactory.createForClass(User);
