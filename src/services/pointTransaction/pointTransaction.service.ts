import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
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

      this.logger.info('PORONE 새로운 토큰이 발급되었습니다.');
      return this.accessToken;
    } catch (error) {
      this.logger.error('PORONE 토큰 요청 실패:', error);
      throw new Error('결제정보를 등록하는데 오류가 발생하였습니다.');
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
          if (imp_uid) {
            const resultUser: User = await this.userService.updateUserPoint(
              user,
              amount,
            );
            const pointTransaction = this.pointTransactionRepository.create({
              impUid: imp_uid,
              status: '충전',
              amount,
              balance: user.userPoint.amount + amount,
              user,
            });
            this.logger.info(
              `-- 유저 포인트 충전,  ${user.name}, ${user.userPoint.amount} --`,
            );
            return await transactionalEntityManager.save(
              PointTransaction,
              pointTransaction,
            );
          }
        } catch (error) {
          const msg = '결제정보를 처리하는도중 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
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
            console.log('비교를해보자---------------------------');
            console.log('비교를해보자---------------------------');
            console.log(fetchUseditem);
            console.log(resultBuyer);
            console.log('비교를해보자---------------------------222222');
            console.log('비교를해보자---------------------------222222');
            console.log('비교를해보자---------------------------222222');
            const updateUseditem = {
              ...fetchUseditem,
              // buyer: { ...resultBuyer },
              soldAt: new Date(),
              updateAt: new Date(),
            };
            const resultUseditem = await transactionalEntityManager.save(
              UsedItem,
              updateUseditem,
            );
            const resultBuyerPointTransaction =
              await transactionalEntityManager.create(PointTransaction, {
                status: '구매',
                amount: -fetchUseditem.price,
                balance: resultBuyer.userPoint.amount,
                user: resultBuyer,
              });
            const resultSellerPointTransaction =
              await transactionalEntityManager.create(PointTransaction, {
                status: '판매',
                amount: fetchUseditem.price,
                balance: resultSeller.userPoint.amount,
                user: resultSeller,
              });
            return resultUseditem;
          }
        } catch (error) {
          this.logger.error(error.message + error);
          throw new InternalServerErrorException(error.message);
        }
      },
    );
  }
}
