import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entity/board.entity';
import { BoardService } from './board.service';
import { BoardResolver } from './board.resolver';
import { BoardAddress } from './entity/boardAddress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Board, BoardAddress])],
  providers: [BoardService, BoardResolver],
})
export class BoardModule {}
