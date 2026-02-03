import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Get()
    getAll() {
        return this.paymentsService.getAll();
    }

    @Get('order/:orderId')
    getByOrderId(@Param('orderId', ParseIntPipe) orderId: number) {
        return this.paymentsService.getByOrderId(orderId);
    }

    @Post()
    create(@Body() body: CreatePaymentDto) {
        return this.paymentsService.create(body);
    }

    @Post('momo/create')
    createMomo(@Body('orderId', ParseIntPipe) orderId: number) {
        return this.paymentsService.createMomoPayment(orderId);
    }

    @Post('momo/ipn')
    handleMomoIpn(@Body() body: Record<string, string | number>) {
        return this.paymentsService.handleMomoNotification(body);
    }

    @Get('momo/return')
    handleMomoReturn(@Query() query: Record<string, string>) {
        return this.paymentsService.handleMomoNotification(query);
    }

    @Post('vnpay/create')
    createVnpay(@Body('orderId', ParseIntPipe) orderId: number, @Req() req: { ip?: string }) {
        return this.paymentsService.createVnpayPayment(orderId, req.ip ?? '127.0.0.1');
    }

    @Get('vnpay/return')
    handleVnpayReturn(@Query() query: Record<string, string>) {
        return this.paymentsService.handleVnpayReturn(query);
    }
}