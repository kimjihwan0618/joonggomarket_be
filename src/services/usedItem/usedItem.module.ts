import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedItem } from './entity/usedItem.entity';
import { BoardService } from './usedItem.service';
import { BoardResolver } from './usedItem.resolver';
import { UsedItemAddress } from './entity/useditemAddress.entity';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsedItem, UsedItemAddress, UsedItemQuestion]),
  ],
  providers: [BoardService, BoardResolver],
})
export class UsedItemModule {}
