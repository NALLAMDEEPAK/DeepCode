import { Controller, Get, UseGuards, Req, Put, Body, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { Request, Response } from 'express';

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

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getUserSettings(@Req() req: Request) {
    const user = req.user as any;
    return this.userService.getUserSettings(user.googleId);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  async updateUserSettings(@Req() req: Request, @Body() settings: any) {
    const user = req.user as any;
    await this.userService.updateUserSettings(user.googleId, settings);
    return { success: true };
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  async exportUserData(@Req() req: Request) {
    const user = req.user as any;
    return this.userService.exportUserData(user.googleId);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@Req() req: Request) {
    const user = req.user as any;
    await this.userService.deleteUserAccount(user.googleId);
    return { success: true };
  }
}