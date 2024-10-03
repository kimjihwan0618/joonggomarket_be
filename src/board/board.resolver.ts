import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entity/board.entity';
// import { UseGuards } from '@nestjs/common';
// import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CreateBoardInput } from './dto/createBoard.input';
import { FetchBoardsInput } from './dto/fetchBoards.input';
import { UpdateBoardInput } from './dto/updateBoard.input';

@Resolver(() => Board)
export class BoardResolver {
  constructor(private boardService: BoardService) {}

  @Query(() => [Board])
  async fetchBoards(
    @Args('fetchBoardsInput') fetchBoardsInput: FetchBoardsInput,
  ): Promise<Board[]> {
    return this.boardService.findAll(fetchBoardsInput);
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

  // @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password') password: string,
  ): Promise<Board> {
    return this.boardService.update(updateBoardInput, boardId, password);
  }

  // @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
  ): Promise<boolean> {
    return this.boardService.remove(boardId);
  }
}
