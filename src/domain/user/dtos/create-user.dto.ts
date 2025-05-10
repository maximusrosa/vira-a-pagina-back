import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../core/enums/user-role.enum';
import { CreateStudentDto } from './create-student-dto';
import { CreateUserModeratorDto } from './create-user-moderator-dto';
import { CreateExchangesModeratorDto } from './create-exchanges-moderator-dto';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Invalid Email' })
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  confirmPassword: string;

  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Invalid Role' })
  role: UserRole;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateStudentDto)
  student?: CreateStudentDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateUserModeratorDto)
  userModerator?: CreateUserModeratorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateExchangesModeratorDto)
  exchangesModerator?: CreateExchangesModeratorDto;
}