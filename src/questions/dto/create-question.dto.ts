import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  content: string;
}
