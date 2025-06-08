import { Module } from '@nestjs/common';
import {RunCodeModule} from './runcode/runcode.module'
import {SubmitCodeModule} from './submitcode/submitcode.module'
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [RunCodeModule, SubmitCodeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
