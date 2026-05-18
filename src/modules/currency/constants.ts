export const CURRENCY_CODES = ['VND', 'USD'] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = 'VND';

export const CURRENCIES: ReadonlyArray<{
    code: CurrencyCode;
    symbol: string;
    name: string;
    locale: string;
}> = [
        { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
        { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
    ];
