import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum, ValidateNested, Matches} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../core/enums/user-role.enum';
import { CreateStudentDto } from './create-student-dto';
import { CreateModeratorDto } from './create-moderator-dto';


export class CreateUserDto {
  // Atributos comuns
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
  confirmPassword: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid Role' })
  role?: UserRole;
  // Atributos específicos
  @ValidateNested()
  @Type(() => CreateStudentDto)
  @IsOptional({ groups: [UserRole.MODERATOR] })
  @IsNotEmpty({ 
    groups: [UserRole.STUDENT],
    message: 'Student data is required when role is STUDENT' 
  })
  student?: CreateStudentDto;

  @ValidateNested()
  @Type(() => CreateModeratorDto)
  moderator?: CreateModeratorDto;
}