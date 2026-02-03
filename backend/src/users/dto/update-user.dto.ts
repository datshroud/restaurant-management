import { IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const roles = ['admin', 'cashier', 'waiter', 'staff'] as const;

export class UpdateUserDto {
    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    @IsIn(roles)
    role?: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;
}
