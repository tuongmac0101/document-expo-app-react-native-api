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

    const safeTemplates = templates.map(t => {
      // Create a shallow copy to avoid mutating the original object if cached
      const templateCopy = { ...t };
      if (templateCopy.questions && Array.isArray(templateCopy.questions)) {
        templateCopy.questions = templateCopy.questions.map(q => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { correctAnswer, explanation, ...qRest } = q;
          return qRest;
        });
      }
      return templateCopy;
    });

    if (!userId) return safeTemplates;

    // Check completion status
    const submissions = await this.surveyResultRepository.find({
      where: { user: { id: userId } },
      select: ['templateId'],
    });
    const completedIds = new Set(submissions.map(s => s.templateId));

    return safeTemplates.map(t => ({
      ...t,
      isCompleted: completedIds.has(t.id),
    }));
  }

  async submit(user: User, templateId: string, rawAnswers: any, timeTaken: number): Promise<SurveyResult> {
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

    const template = await this.surveyTemplateRepository.findOne({ where: { id: templateId } });
    if (!template) {
      throw new Error('Không tìm thấy bộ đề khảo sát.');
    }

    const questions = template.questions as any[];
    let correctCount = 0;

    const surveyData = questions.map(q => {
      const userAnswer = rawAnswers[q.id];
      let isCorrect = false;

      if (q.type === 'checkbox') {
        isCorrect = Array.isArray(userAnswer) &&
          Array.isArray(q.correctAnswer) &&
          userAnswer.length === q.correctAnswer.length &&
          userAnswer.every(val => q.correctAnswer.includes(val));
      } else {
        isCorrect = userAnswer === q.correctAnswer;
      }

      if (isCorrect) correctCount++;

      return {
        question: q.text,
        type: q.type,
        options: q.options,
        answer: userAnswer || null,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect
      };
    });

    const score = (correctCount / questions.length) * 100;

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
    return this.surveyResultRepository.find({
      relations: ['user', 'template'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getSummary(): Promise<any[]> {
    const results = await this.surveyResultRepository.find({
      relations: ['user'],
      select: ['id', 'score', 'createdAt', 'user'],
    });

    const groups: Record<string, any> = {};
    results.forEach(r => {
      const userId = r.user?.id;
      if (!userId) return;

      if (!groups[userId]) {
        groups[userId] = {
          user: r.user,
          attemptsCount: 0,
          totalScore: 0,
          totalTime: 0,
          lastActive: r.createdAt,
        };
      }

      groups[userId].attemptsCount++;
      groups[userId].totalScore += r.score;
      groups[userId].totalTime += (r.timeTaken || 0);
      if (new Date(r.createdAt) > new Date(groups[userId].lastActive)) {
        groups[userId].lastActive = r.createdAt;
      }
    });

    return Object.values(groups).map((g: any) => ({
      user: g.user,
      attemptsCount: g.attemptsCount,
      avgScore: Math.round(g.totalScore / g.attemptsCount),
      avgTime: Math.round(g.totalTime / g.attemptsCount),
      lastActive: g.lastActive,
    }));
  }

  async getResultsByUserId(userId: string): Promise<SurveyResult[]> {
    return this.surveyResultRepository.find({
      where: { user: { id: userId } },
      relations: ['template', 'user'],
      order: { createdAt: 'DESC' },
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
      if (rest.template) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { questions, ...tRest } = rest.template;
        rest.template = tRest as SurveyTemplate;
      }
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
