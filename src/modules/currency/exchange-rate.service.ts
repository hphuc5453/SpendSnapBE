import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";
import { CurrencyCode, DEFAULT_CURRENCY } from "./constants";

const TTL_MS = 24 * 60 * 60 * 1000;
const API_URL = 'https://open.er-api.com/v6/latest/USD';
const FETCH_TIMEOUT_MS = 5000;

interface RatesCache {
    rates: Record<string, number>;
    fetchedAt: number;
}

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    private cache: RatesCache | null = null;
    private inflight: Promise<Record<string, number>> | null = null;

    async getRates(): Promise<Record<string, number>> {
        if (this.cache && Date.now() - this.cache.fetchedAt < TTL_MS) {
            return this.cache.rates;
        }
        if (this.inflight) return this.inflight;

        this.inflight = this.fetchRates();
        try {
            const rates = await this.inflight;
            this.cache = { rates, fetchedAt: Date.now() };
            return rates;
        } finally {
            this.inflight = null;
        }
    }

    convertWith(
        rates: Record<string, number>,
        amount: number,
        from: CurrencyCode,
        to: CurrencyCode,
    ): number {
        if (from === to) return amount;
        const fromRate = rates[from];
        const toRate = rates[to];
        if (!fromRate || !toRate) {
            throw new ServiceUnavailableException(`Missing exchange rate for ${from} or ${to}`);
        }
        return amount * (toRate / fromRate);
    }

    async convert(amount: number, from: CurrencyCode, to: CurrencyCode): Promise<number> {
        if (from === to) return amount;
        const rates = await this.getRates();
        return this.convertWith(rates, amount, from, to);
    }

    normalizeCurrency(value: string | undefined | null): CurrencyCode {
        return (value as CurrencyCode) || DEFAULT_CURRENCY;
    }

    private async fetchRates(): Promise<Record<string, number>> {
        try {
            const res = await axios.get(API_URL, { timeout: FETCH_TIMEOUT_MS });
            const rates = res.data?.rates;
            if (!rates || typeof rates !== 'object') {
                throw new Error('Invalid response shape from exchange rate API');
            }
            return rates as Record<string, number>;
        } catch (err) {
            this.logger.error(`Failed to fetch exchange rates: ${(err as Error).message}`);
            if (this.cache) {
                this.logger.warn('Falling back to stale cached rates');
                return this.cache.rates;
            }
            throw new ServiceUnavailableException('Exchange rate service unavailable');
        }
    }
}
