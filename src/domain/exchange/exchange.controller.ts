import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { UpdateExchangeDto } from './dtos/update-exchange.dto';
import { Exchange } from '@prisma/client';

@Controller('exchanges')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Post()
  async create(@Body() createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    return this.exchangeService.create(createExchangeDto);
  }

  @Get()
  async findAll(): Promise<Exchange[]> {
    return this.exchangeService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Exchange> {
    return this.exchangeService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExchangeDto: UpdateExchangeDto,
  ): Promise<Exchange> {
    return this.exchangeService.update(id, updateExchangeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.exchangeService.remove(id);
  }
}
