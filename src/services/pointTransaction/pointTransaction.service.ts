import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as log4js from 'log4js';
import { PointTransaction } from './entity/pointTransaction.entity';
import axios from 'axios';
import { UserService } from '../user/user.service';
import { User } from '../user/entity/user.entity';

@Injectable()
export class PointTransactionService {
  private logger = log4js.getLogger(PointTransactionService.name);
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    @InjectRepository(PointTransaction)
    private pointTransactionRepository: Repository<PointTransaction>,
    private userService: UserService,
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
    user_id: any,
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
            const user: User = await this.userService.updateUserPoint(
              user_id,
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
}
