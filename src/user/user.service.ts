import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/createUser.input';
import { UserPoint } from './entity/userPoint.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(UserPoint)
    private usersPointRepository: Repository<UserPoint>,
  ) {}

  async findOne(name: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ name });
  }

  async create(createUserInput: CreateUserInput): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    const user = this.usersRepository.create({
      ...createUserInput,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  async findOneByUserEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
