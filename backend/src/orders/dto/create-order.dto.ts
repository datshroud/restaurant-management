import { ArrayMinSize, IsArray, IsInt, Min } from "class-validator";

export class CreateOrderDto {
    @IsInt()
    @Min(1)
    tableId: number;

    @IsArray()
    @ArrayMinSize(1)
    itemIds: any[];
}