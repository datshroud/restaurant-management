import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MenuService } from "./menu.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { diskStorage } from "multer";
import type { StorageEngine } from "multer";
import { existsSync, mkdirSync } from "fs";
import { extname, join } from "path";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const menuImageStorage = diskStorage({
    destination: (_req: unknown, _file: unknown, cb: (error: Error | null, destination: string) => void) => {
        const uploadDir = join(process.cwd(), 'public', 'images');
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (_req: unknown, file: { originalname?: string }, cb: (error: Error | null, filename: string) => void) => {
        const ext = extname(String(file.originalname || ''));
        const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, name);
    },
}) as unknown as StorageEngine;

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Get('items')
    getItems() {
        return this.menuService.getItems();
    }

    @Get('items/all')
    getAllItems() {
        return this.menuService.getAllItems();
    }

    @Get('categories')
    getCategories() {
        return this.menuService.getCategories();
    }

    @Post('categories')
    createCategory(@Body() body: CreateCategoryDto) {
        return this.menuService.createCategory(String(body.name || ''));
    }

    @Put('categories/:id')
    updateCategory(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: CreateCategoryDto,
    ) {
        return this.menuService.updateCategory(id, String(body.name || ''));
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id', ParseIntPipe) id: number) {
        return this.menuService.deleteCategory(id);
    }

    @Get('popular')
    getPopular(@Query('limit') limit?: string) {
        const parsed = limit ? Number(limit) : 5;
        return this.menuService.getPopular(Number.isFinite(parsed) ? parsed : 5);
    }

    @Get('out-of-stock')
    getOutOfStock(@Query('limit') limit?: string) {
        const parsed = limit ? Number(limit) : 5;
        return this.menuService.getOutOfStock(Number.isFinite(parsed) ? parsed : 5);
    }

    @Post('items')
    createItem(@Body() body: {
        categoryId: number;
        name: string;
        description?: string;
        price: number;
        imageUrl?: string;
        stockQty?: number;
        stockUnit?: string;
        isActive?: boolean;
    }) {
        return this.menuService.createItem(body);
    }

    @Put('items/:id')
    updateItem(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: {
            categoryId: number;
            name: string;
            description?: string;
            price: number;
            imageUrl?: string;
            stockQty?: number;
            stockUnit?: string;
            isActive?: boolean;
        },
    ) {
        return this.menuService.updateItem(id, body);
    }

    @Delete('items/:id')
    deleteItem(@Param('id', ParseIntPipe) id: number) {
        return this.menuService.deleteItem(id);
    }

    @Post('items/upload')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    @UseInterceptors(FileInterceptor('file', { storage: menuImageStorage }))
    uploadItemImage(@UploadedFile() file?: { filename?: string }) {
        if (!file) {
            throw new BadRequestException('Thiếu file hình ảnh');
        }
        if (!file.filename) {
            throw new BadRequestException('Không thể lưu hình ảnh');
        }
        return { url: `/images/${file.filename}` };
    }
}