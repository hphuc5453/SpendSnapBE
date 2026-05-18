import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { CurrencyService } from "./currency.service";
import { ok } from "src/commons/swagger";

const CURRENCY_EXAMPLE = [
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN' },
    { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
];

@ApiTags('Currency')
@Controller('currency')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class CurrencyController {
    constructor(private readonly currencyService: CurrencyService) { }

    @Get()
    @ApiOperation({ summary: 'List supported currencies' })
    @ApiOkResponse(ok(CURRENCY_EXAMPLE))
    getCurrencies(): any[] {
        return [...this.currencyService.getCurrencies()];
    }
}
