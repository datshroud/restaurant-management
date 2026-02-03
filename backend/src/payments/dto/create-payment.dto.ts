import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
    @IsInt()
    @Min(1)
    orderId: number;

    @IsString()
    method: string;

    @IsNumber()
    @Min(0)
    amount: number;
}