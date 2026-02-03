import { IsString, MinLength } from "class-validator";

export class UpdateCategoryDto {
    @IsString()
    @MinLength(1)
    name: string;
}