import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
      select: { id: true, username: true, password: true, role: true },
    });
  }

  async create(
    username: string,
    password: string,
    role: 'admin' = 'admin',
  ): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { username } });
    if (existing) throw new ConflictException('Username already exists');

    const hashed = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      password: hashed,
      role,
    });
    return this.userRepository.save(user);
  }
}
