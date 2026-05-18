import { Injectable } from "@nestjs/common";
import { CURRENCIES } from "./constants";

@Injectable()
export class CurrencyService {
    getCurrencies() {
        return CURRENCIES;
    }
}
