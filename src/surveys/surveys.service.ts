import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurveyResult } from './entities/survey-result.entity';
import { SurveyTemplate } from './entities/survey-template.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(SurveyResult)
    private readonly surveyResultRepository: Repository<SurveyResult>,
    @InjectRepository(SurveyTemplate)
    private readonly surveyTemplateRepository: Repository<SurveyTemplate>,
  ) { }

  async createTemplate(title: string, questions: any): Promise<SurveyTemplate> {

    const newTemplate = this.surveyTemplateRepository.create({
      title,
      questions,
      isActive: true,
    });
    return this.surveyTemplateRepository.save(newTemplate);
  }

  async findAllTemplates(userId?: string): Promise<any[]> {
    const templates = await this.surveyTemplateRepository.find({
      order: { createdAt: 'DESC' },
    });

    if (!userId) return templates;

    // Check completion status
    const submissions = await this.surveyResultRepository.find({
      where: { user: { id: userId } },
      select: ['templateId'],
    });
    const completedIds = new Set(submissions.map(s => s.templateId));

    return templates.map(t => ({
      ...t,
      isCompleted: completedIds.has(t.id),
    }));
  }

  async submit(user: User, templateId: string, surveyData: any, score: number, timeTaken: number): Promise<SurveyResult> {
    // Check if already submitted
    const existing = await this.surveyResultRepository.findOne({
      where: { 
        user: { id: user.id },
        templateId 
      }
    });

    if (existing) {
      throw new Error('Bạn đã hoàn thành bộ đề này rồi.');
    }

    const newResult = this.surveyResultRepository.create({
      user,
      templateId,
      surveyData,
      score,
      timeTaken
    });
    return this.surveyResultRepository.save(newResult);
  }

  async getAllResults(): Promise<SurveyResult[]> {
    const results = await this.surveyResultRepository.find({
      relations: ['user', 'template'],
      order: {
        createdAt: 'DESC',
      },
    });
    return results.map(r => {
      const { surveyData, ...rest } = r;
      return rest as SurveyResult;
    });
  }

  async getMyResults(userId: string): Promise<SurveyResult[]> {
    const results = await this.surveyResultRepository.find({
      where: { user: { id: userId } },
      relations: ['template'],
      order: {
        createdAt: 'DESC',
      },
    });
    return results.map(r => {
      const { surveyData, ...rest } = r;
      return rest as SurveyResult;
    });
  }

  async getResultDetail(id: string): Promise<SurveyResult | null> {
    return this.surveyResultRepository.findOne({
      where: { id },
      relations: ['user', 'template'],
    });
  }
}
