import { Injectable } from '@nestjs/common';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';

@Injectable()
export class MappingsService {
  create(createMappingDto: CreateMappingDto) {
    return 'This action adds a new mapping';
  }

  findAll() {
    return `This action returns all mappings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} mapping`;
  }

  update(id: number, updateMappingDto: UpdateMappingDto) {
    return `This action updates a #${id} mapping`;
  }

  remove(id: number) {
    return `This action removes a #${id} mapping`;
  }
}
