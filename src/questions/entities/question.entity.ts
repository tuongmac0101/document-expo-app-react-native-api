import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Answer } from '../../answers/entities/answer.entity';

@Entity('questions')
export class Question extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.questions, { onDelete: 'CASCADE' })
  author: User;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
