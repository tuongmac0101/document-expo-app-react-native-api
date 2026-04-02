import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('SUPABASE_POSTGRES_URL_NON_POOLING')?.replace(/"/g, '');
        // Remove query parameters from URL to avoid overriding our SSL settings
        const cleanUrl = dbUrl?.split('?')[0];

        return {
          type: 'postgres',
          url: cleanUrl,
          entities: [User, Question, Answer],
          synchronize: true, // Auto create table in dev mode
          logging: true,
          ssl: {
            rejectUnauthorized: false,
          },
        };
      },
    }),
    AuthModule,
    UsersModule,
    QuestionsModule,
    AnswersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
