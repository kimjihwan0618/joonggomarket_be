import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entity/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './dto/createUser.input';
import { UserPoint } from './entity/userPoint.entity';
import * as log4js from 'log4js';
import { UpdateUserInput } from './dto/updateUser.input';
import { S3 } from '@aws-sdk/client-s3';
import { FileManagerService } from '../fileManager/fileManager.service';

@Injectable()
export class UserService {
  private logger = log4js.getLogger(UserService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private fileManagerService: FileManagerService,

    @InjectRepository(UserPoint)
    private userPointRepository: Repository<UserPoint>,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

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

  async resetUserPassword(newPassword: string, user: User): Promise<boolean> {
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUser = await this.findById(user._id);
          const hashedPassword = await bcrypt.hash(newPassword, 10);
          const updatedUser = {
            ...fetchUser,
            password: hashedPassword,
          };

          await transactionalEntityManager.save(User, updatedUser);
          return true;
        } catch (error) {
          this.logger.error(error.message + error);
          throw new InternalServerErrorException(error.message);
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

          const params = {
            Bucket: this.bucketName,
            Key: fetchUser.picture ? fetchUser.picture.slice(1) : 'none',
          };

          await this.fileManagerService.deleteFile(
            params,
            fetchUser.picture,
            updateUserInput.picture,
          );

          const updatedUser = {
            ...fetchUser,
            picture: updateUserInput.picture,
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

  async findUserWithPickedUsedItems(_id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { _id },
      relations: ['picked_useditems'],
    });
    return user;
  }

  async updateUserPoint(user: User, price: number): Promise<User> {
    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const amount: number = user.userPoint.amount + price;
          const resultUserPoint = await transactionalEntityManager.save(
            UserPoint,
            {
              ...user.userPoint,
              amount,
              updatedAt: new Date(),
            },
          );
          const updateUser = {
            ...user,
            userPoint: { ...resultUserPoint },
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
