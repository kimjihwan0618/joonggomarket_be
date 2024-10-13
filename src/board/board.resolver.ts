import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entity/board.entity';
// import { UseGuards } from '@nestjs/common';
// import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { GraphQLDateTime } from 'graphql-scalars';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Int } from '@nestjs/graphql';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private boardService: BoardService) {}

  @Query(() => [Board])
  async fetchBoards(
    @Args('endDate', { type: () => GraphQLDateTime, nullable: true })
    endDate: Date,
    @Args('startDate', { type: () => GraphQLDateTime, nullable: true })
    startDate: Date,
    @Args('search', { nullable: true }) search: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<Board[]> {
    return this.boardService.findAll(endDate, startDate, search, page);
  }

  @Query(() => Board)
  async fetchBoard(
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<Board> {
    return this.boardService.findOne(id);
  }

  // @UseGuards(GqlAuthGuard) // jwt 인증시 필요 어노테이션
  @Mutation(() => Board)
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput,
  ): Promise<Board> {
    return this.boardService.create(createBoardInput);
  }

  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password') password: string,
  ): Promise<Board> {
    return this.boardService.update(updateBoardInput, boardId, password);
  }

  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
  ): Promise<boolean> {
    return this.boardService.delete(boardId);
  }
}
