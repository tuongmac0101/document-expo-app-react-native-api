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

  async create(content: string, question: Question, user: User): Promise<Answer> {
    const answer = this.answersRepository.create({
      content,
      question,
      author: user,
    });
    return this.answersRepository.save(answer);
  }

  /**
   * Find all answers by a specific question ID
   */
  async findByQuestion(questionId: string): Promise<Answer[]> {
    return this.answersRepository.find({
      where: { question: { id: questionId } },
      relations: ['author'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Find the user with the most answers
   */
  async getTopContributor(): Promise<{ name: string; count: number } | null> {
    const result = await this.answersRepository
      .createQueryBuilder('answer')
      .leftJoin('answer.author', 'author')
      .select('author.name', 'name')
      .addSelect('COUNT(answer.id)', 'count')
      .groupBy('author.id')
      .addGroupBy('author.name')
      .orderBy('count', 'DESC')
      .limit(1)
      .getRawOne();

    return result ? { name: result.name, count: parseInt(result.count) } : null;
  }
}
