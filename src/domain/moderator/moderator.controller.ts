import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { UserService } from '../user/user.service';
import { BookService, PaginatedBooks } from '../book/book.service';
import { ExchangeService } from '../exchange/exchange.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { Prisma } from '@prisma/client';

@Controller('moderators')
export class ModeratorController {
  constructor(
    private readonly moderatorService: ModeratorService,
    private readonly userService: UserService,
    private readonly bookService: BookService,
    private readonly exchangeService: ExchangeService,
    private readonly evaluationService: EvaluationService,
  ) {}

  @Post()
  create(@Body() createModeratorDto: Prisma.ModeratorCreateInput) {
    return this.moderatorService.create(createModeratorDto);
  }

  @Get()
  findAll() {
    return this.moderatorService.findAll();
  }

  @Get('evaluations')
  findAllEvaluations() {
    return this.evaluationService.findAll();
  }

  @Get('exchanges')
  findAllExchanges() {
    return this.exchangeService.findWaitingForApproval();
  }

  @Get('books')
  async findAllBooks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedBooks> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    console.log(pageNumber, limitNumber);
    return this.bookService.findAllWithPagination(pageNumber, limitNumber, false);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorService.findOne(id);
  }

  @Get('users/email/:email')
  findUserByEmailMod(@Param('email') email: string) {
    return this.userService.findByEmail(email, false);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateModeratorDto: Prisma.ModeratorUpdateInput,
  ) {
    return this.moderatorService.update(id, updateModeratorDto);
  }

  @Patch('exchanges/:id/aprove')
  aproveExchange(@Param('id', ParseIntPipe) id: number,) {
    return this.exchangeService.update(id, { status: 'ACCEPTED' });
  }

  @Patch('exchanges/:id/deny')
  denyExchange(@Param('id', ParseIntPipe) id: number,) {
    return this.exchangeService.update(id, { status: 'REFUSED' });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.moderatorService.remove(id);
  }

  @Delete('books/:id')
  async removeBook(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.bookService.remove(id);
  }

  @Delete('evaluations/:id')
  async removeEvaluation(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.evaluationService.remove(id);
  }
}
