import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointTransaction } from './entity/pointTransaction.entity';
import { PointTransactionService } from './pointTransaction.service';
import { PointTransactionResolver } from './pointTransaction.resolver';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { UsedItemModule } from '../usedItem/useditem.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PointTransaction]),
    UserModule,
    UsedItemModule,
    JwtModule.register({
      secret: 'markets_jwt_secret_key',
      signOptions: { expiresIn: '7d' }, // 토큰 유효기간 설정
    }),
  ],
  providers: [PointTransactionService, PointTransactionResolver],
  exports: [PointTransactionService],
})
export class PointTransactionModule {}
