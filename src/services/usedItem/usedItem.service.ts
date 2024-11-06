import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { UsedItem } from './entity/usedItem.entity';
import { CreateUseditemInput } from './dto/createUsedItem.input';
import { UpdateUseditemInput } from './dto/updateUsedItem.input';
import * as log4js from 'log4js';
import { CreateUseditemQuestionInput } from './dto/createUseditemQuestion.input';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';
import { UpdateUseditemQuestionInput } from './dto/updateUseditemQuestion.input';
import { S3 } from '@aws-sdk/client-s3';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';
import { CreateUseditemQuestionAnswerInput } from './dto/createUseditemQuestionAnswer.input';
import { UpdateUseditemQuestionAnswerInput } from './dto/updateUseditemQuestionAnswer.input';
import { User } from '../user/entity/user.entity';
import { FileManagerService } from '../fileManager/fileManager.service';
import { UserService } from '../user/user.service';

@Injectable()
export class UsedItemService {
  private logger = log4js.getLogger(UsedItemService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
  constructor(
    @InjectRepository(UsedItem)
    private useditemRepository: Repository<UsedItem>,
    private fileManagerService: FileManagerService,
    private userService: UserService,

    @InjectRepository(UsedItemQuestion)
    private useditemQuestionRepository: Repository<UsedItemQuestion>,

    @InjectRepository(UseditemQuestionAnswer)
    private useditemQuestionAnswerRepository: Repository<UseditemQuestionAnswer>,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async fetchUsedItem(_id: string): Promise<UsedItem> {
    return this.useditemRepository.findOne({
      where: { _id },
      relations: ['useditemAddress', 'seller'],
    });
  }

  async fetchUseditems(
    isSoldout: boolean,
    search: string,
    page: number,
  ): Promise<UsedItem[]> {
    try {
      const whereConditions: FindOptionsWhere<UsedItem> = {};
      if (search) {
        whereConditions.name = ILike(`%${search}%`);
      }

      if (isSoldout) {
        whereConditions.soldAt = Not(IsNull());
      } else {
        whereConditions.soldAt = IsNull();
      }

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<UsedItem> = {
        relations: ['useditemAddress', 'seller'],
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
      };
      return this.useditemRepository.find(options);
    } catch (error) {
      const msg = '상품을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  // async fetchUseditemsCountIPicked(): Promise<number> {
  //   return 0;
  // }

  // async fetchUseditemsCountISold(): Promise<number> {
  //   return 0;
  // }

  async fetchUseditemsIPicked(
    search: string,
    page: number,
  ): Promise<UsedItem[]> {
    return [new UsedItem(), new UsedItem()];
  }

  async fetchUseditemsISold(search: string, page: number): Promise<UsedItem[]> {
    return [new UsedItem(), new UsedItem()];
  }

  async fetchUseditemsOfTheBest(): Promise<UsedItem[]> {
    try {
      const query = this.useditemRepository.createQueryBuilder('useditem');
      query.orderBy('useditem.pickedCount', 'DESC').limit(4);

      return query.getMany();
    } catch (error) {
      const msg = '상품 게시글 TOP 4를 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchUseditemQuestions(
    useditemId: string,
    page: number,
  ): Promise<UsedItemQuestion[]> {
    try {
      const whereConditions: FindOptionsWhere<UsedItemQuestion> = {};
      if (useditemId) {
        whereConditions.useditem = { _id: useditemId };
      }

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<UsedItemQuestion> = {
        relations: ['user'],
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
      };
      return this.useditemQuestionRepository.find(options);
    } catch (error) {
      const msg = '상품 질문을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchUseditemQuestionAnswers(
    useditemQuestionId: string,
    page: number,
  ): Promise<UseditemQuestionAnswer[]> {
    try {
      const whereConditions: FindOptionsWhere<UseditemQuestionAnswer> = {};
      if (useditemQuestionId) {
        whereConditions.useditem_question = { _id: useditemQuestionId };
      }

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<UseditemQuestionAnswer> = {
        relations: ['user'],
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
      };
      return this.useditemQuestionAnswerRepository.find(options);
    } catch (error) {
      const msg = '상품 질문 답변을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async createUseditem(
    createUseditemInput: CreateUseditemInput,
    user: User,
  ): Promise<UsedItem> {
    return await this.useditemRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const usedItem = this.useditemRepository.create({
            ...createUseditemInput,
            useditemAddress: createUseditemInput.useditemAddress,
            seller: user,
          });
          this.logger.info(`-- 상품 생성 : ${JSON.stringify(usedItem)} --`);
          return await transactionalEntityManager.save(UsedItem, usedItem);
        } catch (error) {
          const msg = '상품글을 생성하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async deleteUseditem(useditemId: string): Promise<string> {
    return '';
  }

  async updateUseditem(
    updateUseditemInput: UpdateUseditemInput,
    useditemId: string,
  ): Promise<UsedItem> {
    return await this.useditemRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUseditem = await transactionalEntityManager.findOne(
            UsedItem,
            {
              where: { _id: useditemId },
              relations: ['useditemAddress'],
            },
          );

          const params = {
            Bucket: this.bucketName,
            Key: '',
          };
          for (let i = 0; i < 3; i++) {
            params.Key = fetchUseditem.images[i]
              ? fetchUseditem.images[i].slice(1)
              : 'none';
            await this.fileManagerService.deleteFile(
              params,
              fetchUseditem.images[i],
              updateUseditemInput.images[i],
            );
          }

          const updatedUseditem = {
            ...fetchUseditem,
            ...updateUseditemInput,
            useditemAddress: { ...updateUseditemInput.useditemAddress },
            updateAt: new Date(),
          };
          this.logger.info(
            `-- 상품 게시글 수정 : ${JSON.stringify(updatedUseditem)} --`,
          );
          return await transactionalEntityManager.save(
            UsedItem,
            updatedUseditem,
          );
        } catch (error) {
          const msg = '상품 게시글 수정하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async toggleUseditemPick(useditemId: string, user: User): Promise<number> {
    return await this.useditemRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUser: User =
            await this.userService.findUserWithPickedUsedItems(user._id);
          const usedItem = await this.useditemRepository.findOne({
            where: { _id: useditemId },
            relations: ['pickers'],
          });

          if (!usedItem) {
            throw new NotFoundException('상품 조회결과가 없습니다.');
          }

          const isPicked = fetchUser.picked_useditems.some(
            (item) => item._id === useditemId,
          );

          if (isPicked) {
            usedItem.pickers = usedItem.pickers.filter(
              (picker) => picker._id !== fetchUser._id,
            );
            usedItem.pickedCount = (usedItem.pickedCount || 0) - 1;
          } else {
            usedItem.pickers.push(fetchUser);
            usedItem.pickedCount = (usedItem.pickedCount || 0) + 1;
          }

          const resultUseditem = await transactionalEntityManager.save(
            UsedItem,
            usedItem,
          );

          return resultUseditem.pickedCount;
        } catch (error) {
          const msg = '상품을 찜하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async createUseditemQuestion(
    createUseditemQuestionInput: CreateUseditemQuestionInput,
    useditemId: string,
    user: User,
  ): Promise<UsedItemQuestion> {
    return await this.useditemQuestionRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUser: User = await this.userService.findById(user._id);
          const useditem = await transactionalEntityManager.findOne(UsedItem, {
            where: { _id: useditemId },
          });
          if (!useditem) {
            throw new Error('상품을 찾을 수 없습니다.');
          }

          const useditemQuestion = this.useditemQuestionRepository.create({
            ...createUseditemQuestionInput,
            user: fetchUser,
            useditem,
          });
          this.logger.info(
            `-- 상품 질문 생성 : ${JSON.stringify(useditemQuestion)} --`,
          );
          return await transactionalEntityManager.save(
            UsedItemQuestion,
            useditemQuestion,
          );
        } catch (error) {
          const msg = '상품 질문을 생성하는중 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async deleteUseditemQuestion(
    useditemQuestionId: string,
    user: User,
  ): Promise<string> {
    try {
      const useditemQuestion = await this.useditemQuestionRepository.findOne({
        where: { _id: useditemQuestionId, user: { _id: user._id } },
      });
      if (!useditemQuestion) {
        throw new NotFoundException('상품 질문을 조회하는데 실패하였습니다.');
      }
      await this.useditemQuestionRepository.delete(useditemQuestionId);
      return useditemQuestionId;
    } catch (error) {
      const msg = '상품 질문 삭제하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async updateUseditemQuestion(
    updateUseditemQuestionInput: UpdateUseditemQuestionInput,
    useditemQuestionId: string,
    user: User,
  ): Promise<UsedItemQuestion> {
    return await this.useditemQuestionRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUseditemQuestion =
            await transactionalEntityManager.findOne(UsedItemQuestion, {
              where: { _id: useditemQuestionId, user: { _id: user._id } },
            });

          if (!fetchUseditemQuestion) {
            throw new NotFoundException(
              '상품 질문을 조회하는 도중 오류가 발생하였습니다.',
            );
          }

          const updatedUseditemQuestion = {
            ...fetchUseditemQuestion,
            ...updateUseditemQuestionInput,
            updatedAt: new Date(),
          };
          const result = await transactionalEntityManager.save(
            UsedItemQuestion,
            updatedUseditemQuestion,
          );
          return result;
        } catch (error) {
          const msg = '상품 질문을 수정하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async createUseditemQuestionAnswer(
    createUseditemQuestionAnswerInput: CreateUseditemQuestionAnswerInput,
    useditemQuestionId: string,
    user: User,
  ): Promise<UseditemQuestionAnswer> {
    return await this.useditemQuestionAnswerRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUser: User = await this.userService.findById(user._id);
          const useditem_question = await transactionalEntityManager.findOne(
            UsedItemQuestion,
            {
              where: { _id: useditemQuestionId },
            },
          );
          if (!useditem_question) {
            throw new Error('상품 질문을 찾을 수 없습니다.');
          }
          const useditemQuestionAnswer =
            await transactionalEntityManager.create(UseditemQuestionAnswer, {
              ...createUseditemQuestionAnswerInput,
              user: fetchUser,
              useditem_question,
            });
          this.logger.info(
            `-- 상품 질문 답변 생성 : ${JSON.stringify(useditemQuestionAnswer)} --`,
          );
          return await transactionalEntityManager.save(
            UseditemQuestionAnswer,
            useditemQuestionAnswer,
          );
        } catch (error) {
          const msg = '상품 질문 답변을 생성하는중 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async deleteUseditemQuestionAnswer(
    useditemQuestionAnswerId: string,
    user: User,
  ): Promise<string> {
    try {
      const useditemQuestionAnswer =
        await this.useditemQuestionAnswerRepository.findOne({
          where: { _id: useditemQuestionAnswerId, user: { _id: user._id } },
        });
      if (!useditemQuestionAnswer) {
        throw new NotFoundException(
          '상품 질문 답변을 조회하는데 실패하였습니다.',
        );
      }
      await this.useditemQuestionAnswerRepository.delete(
        useditemQuestionAnswerId,
      );
      return useditemQuestionAnswerId;
    } catch (error) {
      const msg = '상품 질문 답변 삭제하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async updateUseditemQuestionAnswer(
    updateUseditemQuestionAnswerInput: UpdateUseditemQuestionAnswerInput,
    useditemQuestionAnswerId: string,
  ): Promise<UseditemQuestionAnswer> {
    return new UseditemQuestionAnswer();
  }
}
