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
  requesterBookId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  providerBookId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  requesterId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  providerId: number;

  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @IsOptional()
  @IsEnum(ExchangeStatus, {
    message: 'Status inválido. Deve ser REQUESTED, ACCEPTED, REFUSED, WAITING_APPROVAL, COMPLETED, ou CANCELED',
  })
  status?: ExchangeStatus;
}
