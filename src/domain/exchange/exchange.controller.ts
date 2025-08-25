import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ExchangeService, PaginatedExchanges } from './exchange.service';
import { CreateExchangeDto } from './dtos/create-exchange.dto';
import { UpdateExchangeDto } from './dtos/update-exchange.dto';
import { Exchange, ExchangeStatus } from '@prisma/client';
import { BookService } from '../book/book.service';

@Controller('exchanges')
export class ExchangeController {
  constructor(
    private readonly exchangeService: ExchangeService,
    private readonly bookService: BookService
  ) {}

  @Post()
  async create(@Body() createExchangeDto: CreateExchangeDto): Promise<Exchange> {
    return this.exchangeService.create(createExchangeDto);
  }

  @Get()
  async findAll(): Promise<PaginatedExchanges> {
    return this.exchangeService.findAllWithPagination();
  }

  @Get('requester/:userId')
  async findByRequester(@Param('userId', ParseIntPipe) userId: number): Promise<Exchange[]> {
    return this.exchangeService.findByRequester(userId);
  }

  @Get('provider/:userId')
  async findByProvider(@Param('userId', ParseIntPipe) userId: number): Promise<Exchange[]> {
    return this.exchangeService.findByProvider(userId);
  }

  @Get('user/:userId')
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedExchanges> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.exchangeService.findByUser(userId, pageNumber, limitNumber);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: ExchangeStatus): Promise<Exchange[]> {
    return this.exchangeService.findByStatus(status);
  }

  @Get('waiting-approval')
  async findWaitingForApproval(): Promise<Exchange[]> {
    return this.exchangeService.findWaitingForApproval();
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

  @Patch(':id/accept')
  async accept(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number, 
): Promise<Exchange> {
    const { providerId } = await this.exchangeService.getProviderId(id);

    if (userId !== providerId) {
      throw new ForbiddenException('Usuário não é o provider dessa troca.');
    }

    return this.exchangeService.update(id, { status: 'WAITING_APPROVAL' });
  }

  @Delete(':id/reject')
  async reject(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number): Promise<void> {
    const { providerId } = await this.exchangeService.getProviderId(id);

    if (userId !== providerId) {
      throw new ForbiddenException('Usuário não é o provider dessa troca.');
    }

    return this.exchangeService.remove(id);
  }

  @Patch(':id/complete')
  async complete(
    @Param('id', ParseIntPipe) id: number,
    @Body('userId', ParseIntPipe) userId: number, 
  ): Promise<Exchange> {
      const exchange = await this.exchangeService.findOne(id);
      const providerId = exchange.providerId;
      const requesterId =  exchange.requesterId;

      if (userId !== requesterId && userId !== providerId) {
        throw new ForbiddenException('Usuário não faz parte desta troca.');
      }

      // Atualiza os status dos livros envolvidos na troca para 'TRADED'
      const bookId1 = exchange.requesterBookId;
      const bookId2 = exchange.providerBookId;
    
      await this.bookService.update(bookId1, { status: 'TRADED' });
      await this.bookService.update(bookId2, { status: 'TRADED' });
    
    return this.exchangeService.update(id, { status: 'COMPLETED' });
  }

  @Patch(':id/cancel')
    async cancel(
      @Param('id', ParseIntPipe) id: number,
      @Body('userId', ParseIntPipe) userId: number, 
  ): Promise<Exchange> {
      const exchange = await this.exchangeService.findOne(id);
      const providerId = exchange.providerId;
      const requesterId =  exchange.requesterId;

      if (userId !== requesterId && userId !== providerId) {
        throw new ForbiddenException('Usuário não faz parte desta troca.');
      }

    return this.exchangeService.update(id, { status: 'CANCELED' });
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.exchangeService.remove(id);
  }
}
