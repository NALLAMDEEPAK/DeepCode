import { Controller, Post, Body, UseGuards, Get, Param, Req, Put } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewService } from './interview.service';
import { Request } from 'express';

export interface ScheduleInterviewDto {
  recipientEmail: string;
  recipientName?: string;
  date: string;
  time: string;
  duration: number;
  topics: string;
  description?: string;
}

export interface AcceptInvitationDto {
  interviewId: string;
  questionSelectionType: 'dsa' | 'ai';
  selectedQuestions?: string[];
  aiPrompt?: string;
  topics?: string[];
}

export interface CancelInvitationDto {
  interviewId: string;
  reason?: string;
}

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  async scheduleInterview(@Body() scheduleData: ScheduleInterviewDto, @Req() req: Request) {
    const user = req.user as any;
    return this.interviewService.scheduleInterview(scheduleData, user);
  }

  @Post('accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Body() acceptData: AcceptInvitationDto, @Req() req: Request) {
    const user = req.user as any;
    return this.interviewService.acceptInvitation(acceptData, user);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  async cancelInvitation(@Body() cancelData: CancelInvitationDto, @Req() req: Request) {
    const user = req.user as any;
    return this.interviewService.cancelInvitation(cancelData, user);
  }

  @Get('my-interviews')
  @UseGuards(JwtAuthGuard)
  async getMyInterviews(@Req() req: Request) {
    const user = req.user as any;
    return this.interviewService.getUserInterviews(user.email);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInterview(@Param('id') id: string) {
    return this.interviewService.getInterviewById(id);
  }

  @Get(':id/questions')
  @UseGuards(JwtAuthGuard)
  async getInterviewQuestions(@Param('id') id: string) {
    return this.interviewService.getInterviewQuestions(id);
  }

  @Get(':id/session')
  @UseGuards(JwtAuthGuard)
  async getInterviewSession(@Param('id') id: string) {
    return this.interviewService.getInterviewSession(id);
  }

  @Put(':id/session/status')
  @UseGuards(JwtAuthGuard)
  async updateSessionStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.interviewService.updateSessionStatus(id, body.status);
  }

  @Get('invitation/:token')
  async getInvitationDetails(@Param('token') token: string) {
    return this.interviewService.getInvitationByToken(token);
  }
}