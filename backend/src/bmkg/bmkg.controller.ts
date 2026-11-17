import { Controller, Get, Query } from '@nestjs/common';
import { BmkgService } from './bmkg.service';
import { GempaService } from './gempa.service';

@Controller()
export class BmkgController {
  constructor(
    private readonly bmkgService: BmkgService,
    private readonly gempaService: GempaService,
  ) {}

  @Get('cuaca')
  getCuaca(@Query('adm4') adm4: string) {
    return this.bmkgService.getPrakiraanCuaca(adm4);
  }

  @Get('gempa/terkini')
  getGempaTerkini() {
    return this.gempaService.getGempaTerkini();
  }

  @Get('gempa/dirasakan')
  getGempaDirasakan() {
    return this.gempaService.getGempaDirasakan();
  }
}

