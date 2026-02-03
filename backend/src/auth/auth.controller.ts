import { Body, Controller, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    register(@Body() body: RegisterDto) {
        return this.authService.register(body);
    }

    @Post('login')
    login(@Body() body: LoginDto) {
        return this.authService.login(body);
    }

    @Get('profile/:id')
    getProfile(@Param('id', ParseIntPipe) id: number) {
        return this.authService.getProfile(id);
    }

    @Put('profile/:id')
    updateProfile(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProfileDto) {
        return this.authService.updateProfile(id, body);
    }

    @Put('password/:id')
    changePassword(@Param('id', ParseIntPipe) id: number, @Body() body: ChangePasswordDto) {
        return this.authService.changePassword(id, body);
    }
}
