import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { BookService } from '../book/book.service';
import { ExchangeController } from './exchange.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, BookService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
