import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;
  @Column({ unique: true, nullable: true })
  googleId: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  avatarUrl: string;

}
