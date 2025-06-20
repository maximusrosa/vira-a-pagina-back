import {
  IsString,
  IsOptional,
  Length,
  IsInt,
  Min,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { BookCondition, BookStatus } from '@prisma/client';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  author?: string;

  @IsOptional()
  @IsInt({ message: 'O ano deve ser um número inteiro.' })
  @Min(0, { message: 'O ano deve ser positivo ou zero.' })
  year?: number;

  @IsOptional()
  @IsString()
  @Length(1, 100)
  discipline?: string;

  @IsOptional()
  @IsEnum(BookCondition, {
    message: 'Condição inválida. Deve ser LIKE_NEW, GOOD ou ACCEPTABLE.',
  })
  condition?: BookCondition;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @IsOptional()
  @IsEnum(BookStatus, {
    message: 'Status inválido. Deve ser AVAILABLE, TRADED ou WAITING_APPROVAL.',
  })
  status?: BookStatus;

  @IsOptional()
  @IsInt({ message: 'ownerId deve ser um número inteiro.' })
  @IsPositive({ message: 'ownerId deve ser positivo.' })
  ownerId?: number;
}
