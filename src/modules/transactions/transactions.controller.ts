import { Body, Controller, Get, Post, UploadedFile, UseInterceptors, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TransactionService } from "./transactions.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { created, errorResponse, ok } from "src/commons/swagger";

const TRANSACTION_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f70',
    userId: '671f0d5e8f9a3b1c2d4e5f60',
    categoryId: {
        _id: '671f0d5e8f9a3b1c2d4e5f80',
        name: 'Coffee',
        icon: 'coffee',
        color: '#8B5A2B',
        kind: 'expense',
    },
    amount: 50000,
    currency: 'VND',
    originalAmount: 50000,
    originalCurrency: 'VND',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/receipt.jpg',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
};

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionService) { }

    @Get()
    @ApiOperation({
        summary: 'List the current user\'s transactions + total spent',
        description: 'Amounts are converted to the user\'s preferred `currency` (see PATCH /users/currency). `originalAmount` / `originalCurrency` preserve the value at creation time. `totalSpent` is the all-time sum of expense transactions in the user\'s currency.',
    })
    @ApiOkResponse(ok({
        transactions: [TRANSACTION_EXAMPLE],
        totalSpent: 4280.50,
        currency: 'VND',
    }))
    async getAll(@Req() req: any): Promise<any> {
        return this.transactionsService.getMyTransactions(req.user.sub);
    }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a transaction (optionally with receipt image)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 50000 },
                categoryId: { type: 'string', example: '671f0d5e8f9a3b1c2d4e5f80' },
                currency: { type: 'string', enum: ['VND', 'USD'], example: 'VND', description: 'Optional. Defaults to the user\'s preferred currency.' },
                image: { type: 'string', format: 'binary' },
            },
            required: ['amount', 'categoryId'],
        },
    })
    @ApiCreatedResponse(created(TRANSACTION_EXAMPLE))
    @ApiResponse(errorResponse(404, 'Category not found'))
    async createTransaction(
        @Req() req: any,
        @UploadedFile() image: Express.Multer.File | undefined,
        @Body() dto: CreateTransactionDto,
    ): Promise<any> {
        return this.transactionsService.create(req.user.sub, dto, image);
    }
}
