import { Controller, Get, UseGuards, Req, Put, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  async getUserStats(@Req() req: Request) {
    const user = req.user as any;
    return this.userService.getUserStats(user.googleId);
  }

  @Put('stats')
  @UseGuards(JwtAuthGuard)
  async updateUserStats(@Req() req: Request, @Body() stats: any) {
    const user = req.user as any;
    await this.userService.updateUserStats(user.googleId, stats);
    return { success: true };
  }
}