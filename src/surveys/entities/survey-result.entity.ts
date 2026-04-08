import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { SurveyTemplate } from './survey-template.entity';

@Entity('survey_results')
export class SurveyResult extends BaseEntity {
  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => SurveyTemplate, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: SurveyTemplate;

  @Column({ nullable: true })
  templateId: string;

  @Column({ type: 'jsonb' })
  surveyData: any;

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'int', default: 0 })
  timeTaken: number; // in seconds
}
