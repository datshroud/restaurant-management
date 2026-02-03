import { ArrayMinSize, IsArray, IsInt, IsOptional, Min } from "class-validator";

export class CreateOrderDto {
    @IsInt()
    @Min(1)
    tableId: number;

    @IsOptional()
    @IsInt()
    createdByUserId?: number;

    @IsArray()
    @ArrayMinSize(1)
    itemIds: any[];
}