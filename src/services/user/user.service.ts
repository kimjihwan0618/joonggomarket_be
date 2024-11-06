import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/createUser.input';
import { UserPoint } from './entity/userPoint.entity';
import * as log4js from 'log4js';
import { UpdateUserInput } from './dto/updateUser.input';

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

  async updateUser(
    updateUserInput: UpdateUserInput,
    user: User,
  ): Promise<User> {
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUser = await transactionalEntityManager.findOne(User, {
            where: { _id: user._id },
            relations: ['userPoint'],
          });

          const updatedUser = {
            ...fetchUser,
            ...updateUserInput,
            updateAt: new Date(),
          };

          this.logger.info(
            `-- 유저 정보가 수정되었습니다. : ${JSON.stringify(updatedUser)} --`,
          );

          return await transactionalEntityManager.save(User, updatedUser);
        } catch (error) {
          const msg = '유저 정보를 수정하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
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

  async updateUserPoint(_id: string, price: number): Promise<User> {
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const user = await this.findById(_id);
          const resultUserPoint = await transactionalEntityManager.save(
            UserPoint,
            {
              ...user.userPoint,
              amount: user.userPoint.amount + price,
              updatedAt: new Date(),
            },
          );
          const updateUser = {
            ...user,
            UserPoint: { ...resultUserPoint },
          };

          return updateUser;
        } catch (error) {
          const msg = '결제 정보를 처리하는중 에러가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(error);
        }
      },
    );
  }
}
