import { Module } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { CurrencyController } from "./currency.controller";
import { ExchangeRateService } from "./exchange-rate.service";

@Module({
    controllers: [CurrencyController],
    providers: [CurrencyService, ExchangeRateService],
    exports: [CurrencyService, ExchangeRateService],
})
export class CurrencyModule { }
