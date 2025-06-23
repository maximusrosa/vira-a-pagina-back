import {
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ExchangeStatus } from '@prisma/client';

export class CreateExchangeDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  matchId: number;

  @IsNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  requesterBooksIds: number[];

  @IsNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  providerBooksIds: number[];

  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @IsOptional()
  @IsEnum(ExchangeStatus, {
    message: 'Status inválido. Deve ser REQUESTED, ACCEPTED, REFUSED, WAITING_APPROVAL, COMPLETED, ou CANCELED',
  })

  status?: ExchangeStatus;

}
