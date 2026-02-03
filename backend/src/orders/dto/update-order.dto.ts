import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, IsOptional, Min, ValidateNested } from 'class-validator';
import { OrderItemDto } from './order-item.dto';

export class UpdateOrderDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    tableId?: number;

    @IsOptional()
    @IsArray()
    @ArrayMinSize(1)
    @IsInt({ each: true })
    @Min(1, { each: true })
    tableIds?: number[];

    @IsOptional()
    @IsInt()
    createdByUserId?: number;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];
}

