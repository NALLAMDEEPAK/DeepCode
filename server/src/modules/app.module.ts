import { Module } from '@nestjs/common';
import {RunCodeModule} from './runcode/runcode.module'
import {SubmitCodeModule} from './submitcode/submitcode.module'
import {InterviewModule} from './interview/interview.module'
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health-check/health.controller';

@Module({
  imports: [RunCodeModule, SubmitCodeModule, InterviewModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}