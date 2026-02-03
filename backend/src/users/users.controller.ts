import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    getAll() {
        return this.usersService.getAll();
    }

    @Post()
    create(@Body() body: CreateUserDto) {
        return this.usersService.create(body);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
        return this.usersService.update(id, body);
    }

}
