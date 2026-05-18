import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";
import type { CurrencyCode } from "../currency/constants";

@Injectable()
export class UserService {

    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async getUserByEmail(email: string): Promise<User | null> {
        const user = await this.userModel.findOne({ email }).lean();
        if (!user) {
            throw new NotFoundException(`There isn't any user with email: ${email}`)
        }
        return user;
    }

    async getUserById(id: string): Promise<User | null> {
        const user = await this.userModel.findById(id).lean();
        if (!user) {
            throw new NotFoundException(`There isn't any user with ID: ${id}`)
        }
        return user;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.userModel.findOne({ email }).lean();
        return user;
    }

    async create(data: any): Promise<User> {
        try {
            const newUser = await this.userModel.create(data);
            return newUser;
        } catch (error) {
            throw error;
        }
    }

    async updateAvatar(userId: string, avatarUrl: string): Promise<User> {
        const user = await this.userModel.findById(userId);

        if (!user) {
            throw new NotFoundException(`User with ID "${userId}" not found`);
        }

        user.avatar = avatarUrl;

        await user.save();

        return user;
    }

    async updateCurrency(userId: string, currency: CurrencyCode): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            { $set: { currency } },
            { new: true, runValidators: true },
        );
        if (!user) {
            throw new NotFoundException(`User with ID "${userId}" not found`);
        }
        return user;
    }
}