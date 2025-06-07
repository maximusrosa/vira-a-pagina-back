import {
  IsString,
  IsNotEmpty,
  Length,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { BookCondition, BookStatus } from '@prisma/client';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: 'O título é obrigatório.' })
  @Length(1, 255)
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'O autor é obrigatório.' })
  @Length(1, 255)
  author: string;

  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(0, { message: 'O ano deve ser positivo ou zero.' })
  year: number;

  @IsString()
  @IsNotEmpty({ message: 'A disciplina é obrigatória.' })
  @Length(1, 100)
  discipline: string;

  @IsEnum(BookCondition, { message: 'Condição inválida. Deve ser NEW, USED ou DAMAGED.' })
  condition: BookCondition;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'A descrição pode ter no máximo 1000 caracteres.' })
  description?: string;

  @IsEnum(BookStatus, {
    message: 'Status inválido. Deve ser AVAILABLE, REQUESTED ou EXCHANGED.',
  })
  status: BookStatus;

  @IsInt({ message: 'ownerId deve ser um número inteiro.' })
  @IsPositive({ message: 'ownerId deve ser positivo.' })
  ownerId: number;

  @IsInt({ message: 'authorizerId deve ser um número inteiro.' })
  @IsPositive({ message: 'authorizerId deve ser positivo.' })
  authorizerId: number;

  // NOTE: createdAt não vem do cliente, é gerado automaticamente pelo Prisma
}