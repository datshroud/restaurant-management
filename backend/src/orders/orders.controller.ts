import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpsertOrderDto } from './dto/upsert-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

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

    @Post('upsert')
    upsert(@Body() body: UpsertOrderDto) {
        return this.ordersService.upsert(body);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateOrderDto) {
        return this.ordersService.updateOrder(id, body);
    }

    @Get(':id')
    GetById(@Param('id', ParseIntPipe) id: number) {
        return this.ordersService.getById(id);
    }
}
