import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import * as log4js from 'log4js';
import { PointTransaction } from './entity/pointTransaction.entity';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';
import { UsedItemService } from '../usedItem/useditem.service';
import { UsedItem } from '../usedItem/entity/usedItem.entity';

@Injectable()
export class PointTransactionService {
  private logger = log4js.getLogger(PointTransactionService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    private userService: UserService,
    private usedItemService: UsedItemService,
  ) {}

  private async getAccessToken(): Promise<string> {
    const now = Math.floor(Date.now() / 1000);

    // 토큰 유효성 확인
    if (this.accessToken && this.tokenExpiry && now < this.tokenExpiry) {
      return this.accessToken;
    }

    // 유효한 토큰이 없으면 새로운 토큰 요청
    try {
      const response = await axios.post(
        'https://api.iamport.kr/users/getToken',
        {
          imp_key: process.env.IMP_KEY,
          imp_secret: process.env.IMP_SECRET,
        },
      );

      const data = response.data.response;
      this.accessToken = data.access_token;
      this.tokenExpiry = data.expired_at;

      this.logger.info('PORTONE 새로운 토큰이 발급되었습니다.');
      return this.accessToken;
    } catch (error) {
      this.logger.error('PORTONE 토큰 요청 실패:', error);
      throw new Error('결제정보를 등록하는데 오류가 발생하였습니다.');
    }
  }

  async fetchPointTransactions(
    search: string,
    page: number,
    user: User,
  ): Promise<PointTransaction[]> {
    try {
      const whereConditions: FindOptionsWhere<PointTransaction> = {
        user: { _id: user._id },
      };

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<PointTransaction> = {
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
        order: {
          createdAt: 'DESC',
        },
      };

      return this.pointTransactionRepository.find(options);
    } catch (error) {
      const msg = '포인트 전체 내역을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchPointTransactionsCount(
    status: string,
    user: User,
  ): Promise<number> {
    try {
      const query =
        this.pointTransactionRepository.createQueryBuilder('pointTransaction');

      query.where('pointTransaction.user._id = :userId', { userId: user._id });

      if (status) {
        query.andWhere('pointTransaction.status = :status', { status });
      }

      return query.getCount();
    } catch (error) {
      const msg = `${status ? status : ''} 포인트 이력을 조회하는데 오류가 발생하였습니다.`;
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchPointTransactionsOfLoading(
    search: string,
    page: number,
    user: User,
  ): Promise<PointTransaction[]> {
    try {
      const whereConditions: FindOptionsWhere<PointTransaction> = {
        user: { _id: user._id },
        status: '충전',
      };

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<PointTransaction> = {
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
        order: {
          createdAt: 'DESC',
        },
      };

      return this.pointTransactionRepository.find(options);
    } catch (error) {
      const msg = '충전 내역을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchPointTransactionsOfBuying(
    search: string,
    page: number,
    user: User,
  ): Promise<PointTransaction[]> {
    try {
      const whereConditions: FindOptionsWhere<PointTransaction> = {
        user: { _id: user._id },
        status: '구매',
      };

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<PointTransaction> = {
        relations: ['useditem'],
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
        order: {
          createdAt: 'DESC',
        },
      };

      return this.pointTransactionRepository.find(options);
    } catch (error) {
      const msg = '구매 내역을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchPointTransactionsOfSelling(
    search: string,
    page: number,
    user: User,
  ): Promise<PointTransaction[]> {
    try {
      const whereConditions: FindOptionsWhere<PointTransaction> = {
        user: { _id: user._id },
        status: '판매',
      };

      const LIMIT = 10;
      const currentPage = page || 1;
      const options: FindManyOptions<PointTransaction> = {
        relations: ['useditem'],
        where: whereConditions,
        skip: (currentPage - 1) * LIMIT,
        take: LIMIT,
        order: {
          createdAt: 'DESC',
        },
      };

      return this.pointTransactionRepository.find(options);
    } catch (error) {
      const msg = '판매 내역을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async createPointTransactionOfLoading(
    impUid: string,
    user: User,
  ): Promise<PointTransaction> {
    const token = await this.getAccessToken();

    return await this.pointTransactionRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const response = await axios.post(
            `https://api.iamport.kr/payments/${impUid}?_token=${token}`,
          );
          const { imp_uid, amount } = response?.data?.response;
          const pointTransactionsOfLoading =
            await this.pointTransactionRepository.find({
              where: {
                impUid,
              },
            });
          if (!imp_uid) {
            throw new BadRequestException(
              '결제정보를 조회하는데 실패하였습니다.',
            );
          } else if (pointTransactionsOfLoading.length > 0) {
            throw new BadRequestException('이미 처리된 충전내역입니다.');
          } else {
            //  포인트 충전시 PortOne 서비스 거래내역 확인 && DB 중복 처리 여부 확인
            const resultUser: User = await this.userService.updateUserPoint(
              user,
              amount,
            );
            const pointTransaction = this.pointTransactionRepository.create({
              impUid: imp_uid,
              status: '충전',
              amount,
              balance: user.userPoint.amount + amount,
              user: resultUser,
            });
            this.logger.info(
              `-- 유저 포인트 충전,  ${user.name}, ${user.userPoint.amount} --`,
            );
            return await transactionalEntityManager.save(
              PointTransaction,
              pointTransaction,
            );
          }
        } catch (error_msg) {
          this.logger.error(error_msg);
          throw new InternalServerErrorException(error_msg);
        }
      },
    );
  }

  async createPointTransactionOfBuyingAndSelling(
    useritemId: string,
    buyer: User,
  ): Promise<UsedItem> {
    return await this.pointTransactionRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchUseditem: UsedItem =
            await this.usedItemService.fetchUsedItem(useritemId);
          if (buyer._id === fetchUseditem.seller._id) {
            throw new BadRequestException('자신의 상품은 구매할 수 없습니다.');
          }
          if (buyer.userPoint.amount < fetchUseditem.price) {
            throw new BadRequestException('포인트가 부족합니다.');
          } else {
            const resultBuyer: User = await this.userService.updateUserPoint(
              buyer,
              -fetchUseditem.price,
            );
            const resultSeller: User = await this.userService.updateUserPoint(
              fetchUseditem.seller,
              fetchUseditem.price,
            );

            const updateUseditem = {
              ...fetchUseditem,
              buyer: resultBuyer,
              seller: resultSeller,
              soldAt: new Date(),
              updateAt: new Date(),
            };

            await transactionalEntityManager.save(PointTransaction, {
              status: '구매',
              amount: -fetchUseditem.price,
              balance: resultBuyer.userPoint.amount,
              user: resultBuyer,
              useditem: updateUseditem,
            });

            await transactionalEntityManager.save(PointTransaction, {
              status: '판매',
              amount: fetchUseditem.price,
              balance: resultSeller.userPoint.amount,
              user: resultSeller,
              useditem: fetchUseditem,
            });

            const resultUseditem = await transactionalEntityManager.save(
              UsedItem,
              updateUseditem,
            );

            this.logger.info(
              `-- 상품 구매  : ${JSON.stringify(resultUseditem)} --`,
            );

            return resultUseditem;
          }
        } catch (error) {
          const msg = '상품을 구매하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }
}
