import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MappingsService } from './mappings.service';
import { CreateMappingDto } from './dto/create-mapping.dto';
import { UpdateMappingDto } from './dto/update-mapping.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mappings')
@Controller('mappings')
export class MappingsController {
  constructor(private readonly mappingsService: MappingsService) {}

  @Post()
  create(@Body() createMappingDto: CreateMappingDto) {
    return this.mappingsService.create(createMappingDto);
  }

  @Get()
  findAll() {
    return this.mappingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mappingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMappingDto: UpdateMappingDto) {
    return this.mappingsService.update(+id, updateMappingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mappingsService.remove(+id);
  }
}
