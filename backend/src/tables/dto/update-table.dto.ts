import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateTableDto {
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

    @IsOptional()
    @IsInt()
    @Min(1)
    seats?: number;

    @IsOptional()
    @IsString()
    @IsIn(['available', 'dine in', 'reservation'])
    status?: string;
}
