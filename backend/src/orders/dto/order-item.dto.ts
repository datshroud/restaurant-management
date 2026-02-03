import { IsInt, Min } from 'class-validator';

export class OrderItemDto {
    @IsInt()
    @Min(1)
    menuItemId: number;

    @IsInt()
    @Min(1)
    qty: number;
}

