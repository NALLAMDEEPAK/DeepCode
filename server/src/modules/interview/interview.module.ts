import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

@Module({
  imports: [HttpModule],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}