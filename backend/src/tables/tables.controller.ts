import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('tables')
export class TablesController {
    constructor(private readonly tablesService: TablesService) {}

    @Get()
    getAll() {
        return this.tablesService.getAll();
    }

    @Post()
    create(@Body() body: CreateTableDto){
        return this.tablesService.create(body);
    }

    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateTableDto) {
        return this.tablesService.update(id, body);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.tablesService.remove(id);
    }
}
