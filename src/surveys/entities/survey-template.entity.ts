import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('survey_templates')
export class SurveyTemplate extends BaseEntity {
  @Column({ type: 'jsonb' })
  questions: any;

  @Column({ nullable: true })
  title: string;

  @Column({ default: true })
  isActive: boolean;
}
