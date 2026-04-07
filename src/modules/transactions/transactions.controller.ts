import { Body, Controller, Get, Post, UploadedFile, UseInterceptors, UseGuards, Req } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { TransactionService } from "./transactions.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionService) { }

    @Get()
    async getAll(): Promise<any[]> {
        // Cập nhật lại logic nếu service có hàm getAll()
        return [];
    }

    @Post('/create')
    @UseInterceptors(FileInterceptor('image'))
    async createTransaction(
        @Req() req: any,
        @UploadedFile() image: Express.Multer.File,
        @Body() body: any
    ): Promise<any> {
        body.userId = req.user.sub;
        return this.transactionsService.create(body, image);
    }
}