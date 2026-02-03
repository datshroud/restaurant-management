import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateTableDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    tableNo?: number;

    @IsInt()
    @Min(1)
    seats: number;
}