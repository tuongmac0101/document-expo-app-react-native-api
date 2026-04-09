import { Body, Controller, Get, Post, Req, UseGuards, Param } from '@nestjs/common';
import { SurveysService } from './surveys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('surveys')
@UseGuards(JwtAuthGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) { }

  @Post('submit')
  async submit(@Req() req: any, @Body() body: { templateId: string; surveyData: any; score: number; timeTaken: number }) {
    return this.surveysService.submit(req.user, body.templateId, body.surveyData, body.score, body.timeTaken);
  }

  @Post('templates')
  async createTemplate(@Body() body: { title: string; questions: any }) {
    return this.surveysService.createTemplate(body.title, body.questions);
  }

  @Get('templates')
  async findAllTemplates(@Req() req: any) {
    const userId = req.user?.id;
    return this.surveysService.findAllTemplates(userId);
  }

  @Get('results')
  @UseGuards(RolesGuard)
  async getAllResults() {
    return this.surveysService.getAllResults();
  }

  @Get('my-results')
  async getMyResults(@Req() req: any) {
    return this.surveysService.getMyResults(req.user.id);
  }

  @Get('results/:id')
  async getResultDetail(@Param('id') id: string, @Req() req: any) {
    const result = await this.surveysService.getResultDetail(id);
    if (!result) return { message: 'Không tìm thấy kết quả' };

    // Security: Only owner or admin can see
    if (result.user.id !== req.user.id && req.user.role !== UserRole.ADMIN) {
      return { message: 'Bạn không có quyền xem kết quả này' };
    }
    return result;
  }
}
