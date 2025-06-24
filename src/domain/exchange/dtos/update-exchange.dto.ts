import { PartialType } from '@nestjs/mapped-types';
import { CreateExchangeDto } from './create-exchange.dto';
import { ExchangeStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateExchangeDto extends PartialType(CreateExchangeDto) {
    @IsOptional()
    @IsEnum(ExchangeStatus, {
      message: 'Status inválido. Deve ser REQUESTED, ACCEPTED, REFUSED, WAITING_APPROVAL, COMPLETED, ou CANCELED',
    })
    status?: ExchangeStatus;
}
