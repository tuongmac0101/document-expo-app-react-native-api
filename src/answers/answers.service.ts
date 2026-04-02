import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { Question } from '../questions/entities/question.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private answersRepository: Repository<Answer>,
  ) {}

  /**
   * Create a new answer for a question
   */
  async create(content: string, question: Question, user: User): Promise<Answer> {
    const answer = this.answersRepository.create({
      content,
      question,
      author: user,
    });
    return this.answersRepository.save(answer);
  }
}
