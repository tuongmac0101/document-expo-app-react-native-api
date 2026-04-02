import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Create a new question (requires JWT authentication)
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createQuestionDto: CreateQuestionDto, @Req() req: any) {
    // Extract user info from decoded JWT
    const { id, email, name } = req.user;
    
    // Ensure the user exists in our local database for foreign key integrity
    const user = await this.usersService.findOrCreate(id, email, name);
    
    return this.questionsService.create(createQuestionDto, user);
  }

  /**
   * Get all questions (Public access)
   */
  @Get()
  async findAll() {
    return this.questionsService.findAll();
  }

  /**
   * Get detail of a specific question (Public access)
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.questionsService.findOne(id);
  }
}
