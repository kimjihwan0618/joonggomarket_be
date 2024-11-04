import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UsedItem } from './entity/usedItem.entity';
import { CreateUseditemInput } from './dto/createUsedItem.input';
import { UpdateUseditemInput } from './dto/updateUsedItem.input';
import * as log4js from 'log4js';
import { CreateUseditemQuestionInput } from './dto/createUseditemQuestion.input';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';
import { UpdateUseditemQuestionInput } from './dto/updateUseditemQuestion.input';
import { DeleteObjectCommand, S3 } from '@aws-sdk/client-s3';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';
import { CreateUseditemQuestionAnswerInput } from './dto/createUseditemQuestionAnswer.input';
import { UpdateUseditemQuestionAnswerInput } from './dto/updateUseditemQuestionAnswer.input';

@Injectable()
export class UsedItemService {
  private logger = log4js.getLogger(UsedItemService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
  constructor(
    @InjectRepository(UsedItem)
    private usedItemRepository: Repository<UsedItem>,

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
    return this.usedItemRepository.findOne({
      where: { _id },
      relations: ['usedItemAddress'],
    });
  }

  async fetchUseditems(
    isSoldout: boolean,
    search: string,
    page: number,
  ): Promise<UsedItem[]> {
    try {
      const query = this.usedItemRepository.createQueryBuilder('usedItem');
      if (search) {
        query.andWhere('usedItem.name LIKE :search', { search: `%${search}%` });
      }

      if (isSoldout) {
        query.andWhere('usedItem.soldAt IS NULL');
      } else {
        query.andWhere('usedItem.soldAt IS NOT NULL');
      }
      const limit = 10;
      const currentPage = page || 1;
      query.skip((currentPage - 1) * limit).take(limit);

      return query.getMany();
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
    return [new UsedItem(), new UsedItem()];
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
  ): Promise<UsedItem> {
    return new UsedItem();
  }

  async deleteUseditem(useditemId: string): Promise<string> {
    return '';
  }

  async updateUseditem(
    updateUseditemInput: UpdateUseditemInput,
    useditemId: string,
  ): Promise<number> {
    return 0;
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
