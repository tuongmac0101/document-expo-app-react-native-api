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

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { googleId } });
  }

  async findOrCreate(email: string, name?: string, avatarUrl?: string, googleId?: string): Promise<User> {
    // Luôn ưu tiên tìm theo email vì email là duy nhất
    let user = await this.findByEmail(email);

    if (user) {
      // Nếu tìm thấy, cập nhật thông thông tin nếu cần
      let updated = false;
      if (googleId && !user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await this.usersRepository.save(user);
      }
    } else {
      // Nếu không tìm thấy theo email, thử tìm theo googleId
      if (googleId) {
        user = await this.findByGoogleId(googleId);
      }

      if (!user) {
        // Tạo mới User (ID sẽ tự động sinh bởi TypeORM là UUID)
        user = this.usersRepository.create({ 
          email, 
          name, 
          avatarUrl,
          googleId: googleId || undefined
        });
        await this.usersRepository.save(user);
      }
    }
    
    return user;
  }
}
