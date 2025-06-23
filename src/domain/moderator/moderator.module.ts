import { Module } from '@nestjs/common';
import { ModeratorService } from './moderator.service';
import { ModeratorController } from './moderator.controller';
import { DatabaseModule } from '../../database/database.module';
import { UserService } from '../user/user.service';
import { BookService } from '../book/book.service';
import { ExchangeService } from '../exchange/exchange.service';
import { EvaluationService } from '../evaluation/evaluation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ModeratorController],
  providers: [ModeratorService, UserService, BookService, ExchangeService, EvaluationService],
  exports: [ModeratorService],
})
export class ModeratorModule {}
