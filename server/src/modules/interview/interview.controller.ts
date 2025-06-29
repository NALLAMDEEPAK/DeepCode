import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InterviewService } from './interview.service';

export interface ScheduleInterviewDto {
  recipientEmail: string;
  recipientName?: string;
  date: string;
  time: string;
  duration: number;
  topics: string;
  description?: string;
}

@Controller('interview')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post('schedule')
  @UseGuards(JwtAuthGuard)
  async scheduleInterview(@Body() scheduleData: ScheduleInterviewDto) {
    return this.interviewService.scheduleInterview(scheduleData);
  }
}