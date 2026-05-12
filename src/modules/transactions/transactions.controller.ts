import { Body, Controller, Get, Post, UploadedFile, UseInterceptors, UseGuards, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TransactionService } from "./transactions.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";
import { created, ok } from "src/commons/swagger";

const TRANSACTION_EXAMPLE = {
    _id: '671f0d5e8f9a3b1c2d4e5f70',
    userId: '671f0d5e8f9a3b1c2d4e5f60',
    amount: 50000,
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1/receipt.jpg',
    categoryId: '671f0d5e8f9a3b1c2d4e5f80',
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
    @ApiOperation({ summary: 'List the current user\'s transactions (newest first)' })
    @ApiOkResponse(ok([TRANSACTION_EXAMPLE]))
    async getAll(@Req() req: any,): Promise<any[]> {
        return this.transactionsService.getMyTransactions(req.user.sub);
    }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: 'Create a transaction with optional receipt image' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                amount: { type: 'number', example: 50000 },
                image: { type: 'string', format: 'binary' },
            },
            required: ['amount'],
        },
    })
    @ApiCreatedResponse(created(TRANSACTION_EXAMPLE))
    async createTransaction(
        @Req() req: any,
        @UploadedFile() image: Express.Multer.File,
        @Body() body: any
    ): Promise<any> {
        body.userId = req.user.sub;
        return this.transactionsService.create(body, image);
    }
}
