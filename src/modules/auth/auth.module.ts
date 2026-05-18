import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { User, UserSchema } from '../user/user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtShareModule } from './jwt-share.module';
import { CategoryModule } from '../category/category.module';
import { MailModule } from '../mail/mail.module';
import { PasswordReset, PasswordResetSchema } from './password-reset.schema';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtShareModule,
    CategoryModule,
    MailModule,
    MongooseModule.forFeature([
      { name: PasswordReset.name, schema: PasswordResetSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule { }
