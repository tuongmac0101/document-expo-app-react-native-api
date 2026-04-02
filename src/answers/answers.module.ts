import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersService } from './answers.service';
import { AnswersController, AnswersQueryController } from './answers.controller';
import { Answer } from './entities/answer.entity';
import { QuestionsModule } from '../questions/questions.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Answer]),
    QuestionsModule,
    UsersModule,
  ],
  controllers: [AnswersController, AnswersQueryController],
  providers: [AnswersService],
})
export class AnswersModule {}
