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

@Injectable()
export class UsedItemService {
  private logger = log4js.getLogger(UsedItemService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
  private fileManagerService: FileManagerService;
  constructor(
    @InjectRepository(UsedItem)
    private useditemRepository: Repository<UsedItem>,

    // @InjectRepository(BoardAddress)
    // private boardAddressRepository: Repository<BoardAddress>,

    // @InjectRepository(BoardComment)
    // private boardCommentRepository: Repository<BoardComment>,
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
    return [new UsedItemQuestion(), new UsedItemQuestion()];
  }

  async fetchUseditemQuestionAnswers(
    useditemQuestionId: string,
    page: number,
  ): Promise<UseditemQuestionAnswer[]> {
    return [new UseditemQuestionAnswer(), new UseditemQuestionAnswer()];
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

  async toggleUseditemPick(useditemId: string): Promise<number> {
    return 0;
  }

  async createUseditemQuestion(
    createUseditemQuestionInput: CreateUseditemQuestionInput,
    useditemId: string,
  ): Promise<UsedItemQuestion> {
    return new UsedItemQuestion();
  }

  async deleteUseditemQuestion(useditemQuestionId: string): Promise<number> {
    return 0;
  }

  async updateUseditemQuestion(
    updateUseditemQuestionInput: UpdateUseditemQuestionInput,
    useditemQuestionId: string,
  ): Promise<UsedItemQuestion> {
    return new UsedItemQuestion();
  }

  async createUseditemQuestionAnswer(
    createUseditemQuestionAnswerInput: CreateUseditemQuestionAnswerInput,
    useditemQuestionId: string,
  ): Promise<UseditemQuestionAnswer> {
    return new UseditemQuestionAnswer();
  }

  async deleteUseditemQuestionAnswer(
    useditemQuestionAnswerId: string,
  ): Promise<string> {
    return '';
  }

  async updateUseditemQuestionAnswer(
    updateUseditemQuestionAnswerInput: UpdateUseditemQuestionAnswerInput,
    useditemQuestionAnswerId: string,
  ): Promise<UseditemQuestionAnswer> {
    return new UseditemQuestionAnswer();
  }
}
