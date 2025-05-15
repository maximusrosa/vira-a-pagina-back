import { Controller, Post, UseGuards, Request, Body, Get, HttpException, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from 'src/core/guards/local-auth.guard';
import { CreateUserDto } from 'src/domain/user/dtos/create-user.dto';
import { HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(@Request() req: { user: any }) {
        const token = this.authService.login(req.user);

        if (!token) throw new HttpException('Invalid Credentials', 401);
        return token;
    }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    async signup(@Body() signupDto: CreateUserDto) {
        return await this.authService.signup(signupDto);
    }
}
