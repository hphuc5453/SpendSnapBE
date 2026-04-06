import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";

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

    async getAll(): Promise<User[]> {
        return this.userModel.find();
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
}