import { Module } from '@nestjs/common';
import { RunCodeModule } from './runcode/runcode.module';
import { SubmitCodeModule } from './submitcode/submitcode.module';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health-check/health.controller';
import { DsaListModule } from './get-dsa-list/get_dsa_list.module';
import { DsaListController } from './get-dsa-list/get_dsa_list.controller';
import { DsaListService } from './get-dsa-list/get_dsa_list.service';
import { InterviewModule } from './interview/interview.module';
import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { VideocallModule } from './videocall/videocall.module';

@Module({
  imports: [RunCodeModule, SubmitCodeModule, DsaListModule, AuthModule, InterviewModule, EmailModule, UserModule, VideocallModule],
  controllers: [AppController, HealthController, DsaListController],
  providers: [AppService, DsaListService],
})
export class AppModule {}