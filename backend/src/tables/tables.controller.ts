import { Body, Controller, Get, Post } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';

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
}
