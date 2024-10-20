import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/createUser.input';
import { UserPoint } from './entity/userPoint.entity';
import * as log4js from 'log4js';

@Injectable()
export class UserService {
  private logger = log4js.getLogger(UserService.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(UserPoint)
    private userPointRepository: Repository<UserPoint>,
  ) {}

  async createUser(createUserInput: CreateUserInput): Promise<User> {
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const userPoint = await transactionalEntityManager.save(UserPoint, {
            amount: 0,
          });
          const hashedPassword = await bcrypt.hash(
            createUserInput.password,
            10,
          );
          const user = this.userRepository.create({
            ...createUserInput,
            password: hashedPassword,
            userPoint,
            _id: userPoint._id,
          });
          this.logger.error(`-- 유저 생성: ${JSON.stringify(user)} --`);

          return await transactionalEntityManager.save(User, user);
        } catch (error) {
          this.logger.error(`-- 유저 생성 Error: ${error} --`);
          throw error;
        }
      },
    );
  }

  async findOneByUserEmail(email: string): Promise<User> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['userPoint'],
    });
  }

  async findById(_id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { _id },
      relations: ['userPoint'],
    });
    return user;
  }
}
