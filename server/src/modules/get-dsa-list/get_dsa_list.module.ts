import { Module } from '@nestjs/common';
import { DsaListService } from './get_dsa_list.service';
import { DsaListController } from './get_dsa_list.controller';

@Module({
  controllers: [DsaListController],
  providers: [DsaListService],
})
export class DsaListModule {}
