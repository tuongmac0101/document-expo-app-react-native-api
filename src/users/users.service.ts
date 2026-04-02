import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findOrCreate(id: string, email: string, name?: string, avatarUrl?: string): Promise<User> {
    let user = await this.findById(id);
    if (!user) {
      user = this.usersRepository.create({ id, email, name, avatarUrl });
      await this.usersRepository.save(user);
    }
    return user;
  }
}
