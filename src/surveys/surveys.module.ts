import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SurveysService } from './surveys.service';
import { SurveysController } from './surveys.controller';
import { SurveyResult } from './entities/survey-result.entity';
import { SurveyTemplate } from './entities/survey-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SurveyResult, SurveyTemplate])],
  controllers: [SurveysController],
  providers: [SurveysService],
})
export class SurveysModule {}
