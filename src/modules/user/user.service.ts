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
            console.log('Data nhận được:', data);
            const newUser = await this.userModel.create(data);
            return newUser;
        } catch (error) {
            console.error('Lỗi Mongoose cụ thể:', error.message); // Nhìn vào terminal để xem lỗi gì
            throw error;
        }
    }

    async getAll(): Promise<User[]> {
        return this.userModel.find();
    }
}