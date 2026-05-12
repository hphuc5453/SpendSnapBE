import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { Module } from "@nestjs/common";
import { JwtShareService } from "./jwt-share.service";

// jwt-share.module.ts
@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('APP_SECRET'),
                signOptions: { expiresIn: '1w' },
            }),
        }),
    ],
    providers: [JwtStrategy, JwtShareService], // Chiến lược verify token
    exports: [JwtModule, PassportModule, JwtStrategy, JwtShareService],
})
export class JwtShareModule { }