import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedItem } from './entity/usedItem.entity';
import { UsedItemAddress } from './entity/useditemAddress.entity';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';
import { UsedItemService } from './usedItem.service';
import { UsedItemResolver } from './usedItem.resolver';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsedItem,
      UsedItemAddress,
      UsedItemQuestion,
      UseditemQuestionAnswer,
    ]),
  ],
  providers: [UsedItemService, UsedItemResolver],
})
export class UsedItemModule {}
