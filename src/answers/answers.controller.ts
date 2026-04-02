import { Body, Controller, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QuestionsService } from '../questions/questions.service';
import { UsersService } from '../users/users.service';

@Controller('questions/:id/answers')
export class AnswersController {
  constructor(
    private readonly answersService: AnswersService,
    private readonly questionsService: QuestionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Post an answer to a question (requires Auth)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() createAnswerDto: CreateAnswerDto,
    @Req() req: any,
  ) {
    // Check if the question exists
    const question = await this.questionsService.findOne(questionId);

    // Get or create responder info from JWT
    const { id, email, name } = req.user;
    const author = await this.usersService.findOrCreate(id, email, name);

    return this.answersService.create(createAnswerDto.content, question, author);
  }
}
