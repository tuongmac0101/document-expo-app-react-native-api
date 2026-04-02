import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('answers')
export class Answer extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  question: Question;

  @ManyToOne(() => User, (user) => user.answers, { onDelete: 'CASCADE' })
  author: User;
}
