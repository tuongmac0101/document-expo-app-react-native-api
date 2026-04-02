import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { User } from './users/entities/user.entity';
import { Question } from './questions/entities/question.entity';
import { Answer } from './answers/entities/answer.entity';

@Module({
  imports: [
    // Load .env variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configure PostgreSQL with TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Question, Answer],
        synchronize: true, // Auto create table in dev mode
        logging: true,
      }),
    }),
    AuthModule,
    UsersModule,
    QuestionsModule,
    AnswersModule,
  ],
})
export class AppModule {}
