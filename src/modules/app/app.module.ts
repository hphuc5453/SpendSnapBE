import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsModule } from '../transactions/transactions.module';
import { CategoryModule } from '../category/category.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { SocketModule } from '../socket/socket.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONOGODB_CONNECTION'),
        dbName: 'spend_snap'
      }),
    }),
    AuthModule,
    UserModule,
    TransactionsModule,
    CategoryModule,
    StatisticsModule,
    SocketModule,
    CurrencyModule,
  ],
})
export class AppModule { }