import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { UserStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
