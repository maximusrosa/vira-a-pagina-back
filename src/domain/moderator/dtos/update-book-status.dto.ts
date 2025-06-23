import { IsEnum, IsNotEmpty } from 'class-validator';
import { BookStatus } from '@prisma/client';

export class UpdateBookStatusDto {
  @IsNotEmpty()
  @IsEnum(BookStatus, {
    message: 'Status inválido. Deve ser AVAILABLE, TRADED, WAITING_APPROVAL ou REJECTED.',
  })
  status: BookStatus;
}
