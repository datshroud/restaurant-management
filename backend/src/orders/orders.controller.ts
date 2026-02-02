import { Body, Controller, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Get()
    getAll() {
        return this.ordersService.getAll();
    }

    @Post()
    create(@Body() body: CreateOrderDto){
        return this.ordersService.create(body);
    }
}
