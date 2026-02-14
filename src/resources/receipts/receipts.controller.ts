import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ReceiptService } from './receipts.service';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Prisma, Role, User } from '@prisma/client';
import { RolesGuard } from 'src/global/auth/guards/auth.guard';
import { Roles } from 'src/global/auth/guards/roles.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from 'src/global/current-logged-in/current-user.decorator';
import { CreateReceiptDto } from './dto/create-receipt.dto';

// @UseGuards(RolesGuard)
@ApiTags('receipts')
@Controller('receipts')
@SkipThrottle()
export class ReceiptController {
  constructor(private readonly receiptService: ReceiptService) { }

  @Post()
  @ApiOperation({ summary: 'create project data' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AGENT)
  create(
    @Body() createreceiptDatumDto: CreateReceiptDto,
    @CurrentUser() user: Partial<User>,
  ) {
    return this.receiptService.createOne(createreceiptDatumDto, <string>user?.company_id);
  }

  // bulk create a receipts
  @Post('many')
  @ApiOperation({ summary: 'create project data' })
  @UseGuards(RolesGuard)
  @Roles(Role.ADG, Role.AGENT)
  async bulkCreate(
    @Body() createreceiptDatumDto: { data: any }, // this data is sent from phone in JSON string
    @CurrentUser() user: Partial<User>,
  ) {

    const result = await this.receiptService.bulkCreate(createreceiptDatumDto?.data, <string>user?.company_id);
    console.log('receipts created response: ', result);
    return result;
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get()
  @ApiOperation({ summary: 'find all receipts' })
  findAll(@Query() query: any, @CurrentUser() user: Partial<User>) {
    return this.receiptService.findAll(query, <string>user?.company_id);
  }

  // get the current receipt
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Get(':id')
  @ApiOperation({ summary: 'find the currently receipt of the connected user' })
  findOne(@Param('id') id: string) {
    return this.receiptService.findOne(id);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'update one receipt with its id' })
  update(
    @Param('id') id: string,
    @Body() updateReceiptDatumDto: Prisma.ReceiptUpdateInput,
  ) {
    return this.receiptService.update(id, updateReceiptDatumDto);
  }

  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  @Delete(':id')
  @Roles(Role.ADG)
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string) {
    return this.receiptService.remove(id);
  }
}