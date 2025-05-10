import {IsOptional} from 'class-validator';

export class CreateUserModeratorDto {
  @IsOptional()
  lastActivityAt?: Date;
}