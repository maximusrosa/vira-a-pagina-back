import { Module } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { ExchangeController } from './exchange.controller';
import { DatabaseModule } from '../../database/database.module';
import { MatchService } from '../match/match.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ExchangeController],
  providers: [ExchangeService, MatchService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
