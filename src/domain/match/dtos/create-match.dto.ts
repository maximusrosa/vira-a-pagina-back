import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateMatchDto {
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  user1Id: number;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  user2Id: number;

  @IsNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  booksUser1Ids: number[];

  @IsNotEmpty()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  booksUser2Ids: number[];
}
