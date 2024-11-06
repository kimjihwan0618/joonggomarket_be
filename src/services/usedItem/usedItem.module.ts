import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsedItem } from './entity/usedItem.entity';
import { UsedItemAddress } from './entity/useditemAddress.entity';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';
import { UsedItemService } from './useditem.service';
import { UsedItemResolver } from './useditem.resolver';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';
import { UserModule } from '../user/user.module';
import { FileManagerModule } from '../fileManager/fileManager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsedItem,
      UsedItemAddress,
      UsedItemQuestion,
      UseditemQuestionAnswer,
    ]),
    FileManagerModule,
    UserModule,
  ],
  providers: [UsedItemService, UsedItemResolver],
})
export class UsedItemModule {}
