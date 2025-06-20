import {
  IsNotEmpty,
  IsInt,
  IsPositive,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateEvaluationDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  raterId: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  ratedId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating: number;
}
