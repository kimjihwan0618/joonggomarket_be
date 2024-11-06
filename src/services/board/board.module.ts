import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { BoardAddress } from './entity/boardAddress.entity';
import { BoardComment } from './entity/boardComment.entity';
import { FileManagerModule } from '../fileManager/fileManager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardAddress, BoardComment]),
    FileManagerModule,
  ],
  providers: [BoardService, BoardResolver],
})
export class BoardModule {}
