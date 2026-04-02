import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  content: string;
}
