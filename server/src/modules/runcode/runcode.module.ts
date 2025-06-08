import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RunCodeController } from './runcode.controller';

@Module({
  imports: [HttpModule],
  controllers: [RunCodeController],
})
export class RunCodeModule {}
