import { IsEmail, IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty()
  @IsString()
  uniCard: string;

  @IsNotEmpty()
  @IsString()
  course: string;

  @IsNotEmpty()
  @IsString()
  contact: string;

  @IsOptional()
  rating?: number;
}