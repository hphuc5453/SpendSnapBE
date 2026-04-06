import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { User, UserSchema } from "./user.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), CloudinaryModule],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService]
})

export class UserModule { }