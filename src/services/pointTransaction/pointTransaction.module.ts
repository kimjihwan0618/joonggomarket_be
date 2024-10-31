import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointTransaction } from './entity/pointTransaction.entity';
import { PointTransactionService } from './pointTransaction.service';
import { PointTransactionResolver } from './pointTransaction.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([PointTransaction])],
  providers: [PointTransactionService, PointTransactionResolver],
  exports: [PointTransactionService],
})
export class PointTransactionModule {}
