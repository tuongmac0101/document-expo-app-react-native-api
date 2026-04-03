import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { User } from '../users/entities/user.entity';

import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    private socketGateway: SocketGateway,
  ) {}

  /**
   * Create a new question
   */
  async create(createQuestionDto: CreateQuestionDto, user: User): Promise<Question> {
    const question = this.questionsRepository.create({
      ...createQuestionDto,
      author: user,
    });
    const savedQuestion = await this.questionsRepository.save(question);
    this.socketGateway.emitNewQuestion(savedQuestion);
    return savedQuestion;
  }

  /**
   * Find all questions with author info
   */
  async findAll(): Promise<Question[]> {
    return this.questionsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find a specific question with details and answers
   */
  async findOne(id: string): Promise<Question> {
    const question = await this.questionsRepository.findOne({
      where: { id },
      relations: ['author', 'answers', 'answers.author'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }
    return question;
  }
}
