
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubmitCodeController } from './submitcode.controller';

@Module({
  imports: [HttpModule],
  controllers: [SubmitCodeController],
})
export class SubmitCodeModule {}
