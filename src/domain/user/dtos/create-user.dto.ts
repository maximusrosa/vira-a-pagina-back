import { IsEmail, IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { UserStatus } from '@prisma/client';
import { User } from '../entities/user.entity';


export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail({}, { message: 'Invalid Email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  uniCard: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  contact: string;
}