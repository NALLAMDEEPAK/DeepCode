import { Controller, Get } from '@nestjs/common';
import { DsaListService } from './get_dsa_list.service';

@Controller('dsalist')
export class DsaListController {
  constructor(private readonly dsaListService: DsaListService) {}

  @Get()
  async getList() {
    return this.dsaListService.getDsaList();
  }
}
