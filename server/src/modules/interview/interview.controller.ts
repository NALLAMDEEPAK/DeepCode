import { Controller, Post, Body, UseGuards, Get, Param, Req } from '@nestjs/common';
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getInterview(@Param('id') id: string) {
    return this.interviewService.getInterviewById(id);
  }

  @Get('invitation/:token')
  async getInvitationDetails(@Param('token') token: string) {
    return this.interviewService.getInvitationByToken(token);
  }
}