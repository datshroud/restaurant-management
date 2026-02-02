import { IsInt, IsString, Min } from "class-validator";

export class CreateTableDto {
    @IsString()
    name: string;

    @IsInt()
    @Min(1)
    seats: number;
}