import { IsOptional } from 'class-validator';

export class CreateExchangesModeratorDto {
  @IsOptional()
  moderatedExchanges?: number;

  @IsOptional()
  lastActivityAt?: Date;
}