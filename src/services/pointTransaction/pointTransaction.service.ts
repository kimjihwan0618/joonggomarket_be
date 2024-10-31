import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as log4js from 'log4js';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';
import { PointTransaction } from './entity/pointTransaction.entity';

@Injectable()
export class PointTransactionService {
  private logger = log4js.getLogger(PointTransactionService.name);

  constructor(
    @InjectRepository(PointTransaction)
    private pointTransactionServiceRepository: Repository<PointTransactionService>,
  ) {
    // this.s3 = new S3({
    //   region: process.env.AWS_REGION,
    //   credentials: {
    //     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    //     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    //   },
    // });
  }

  async createPointTransactionOfLoading(
    impUid: string,
  ): Promise<PointTransaction> {
    return await this.pointTransactionServiceRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {},
    );
  }
}
