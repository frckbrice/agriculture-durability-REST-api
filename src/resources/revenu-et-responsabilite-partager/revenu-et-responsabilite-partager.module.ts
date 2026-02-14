import { Module } from '@nestjs/common';
import { RevenuEtResponsabilitePartagerController } from './revenu-et-responsabilite-partager.controller';
import { RevenuEtResponsabilitePartagerService } from './revenu-et-responsabilite-partager.service';

@Module({
  controllers: [RevenuEtResponsabilitePartagerController],
  providers: [RevenuEtResponsabilitePartagerService]
})
export class RevenuEtResponsabilitePartagerModule {}
