import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { BoardAddress } from './entity/boardAddress.entity';
import { BoardComment } from './entity/boardComment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardAddress, BoardComment])],
  providers: [BoardService, BoardResolver],
})
export class BoardModule {}
