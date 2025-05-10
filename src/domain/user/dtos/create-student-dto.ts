import { IsEmail, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateStudentDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  rating?: number;
}