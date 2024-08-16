import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CreateBoardInput } from './dto/createBoard.input';
import { FetchBoardsInput } from './dto/fetchBoards.input';
import { UpdateBoardInput } from './dto/updateBoard.input';

@Resolver(() => Board)
export class BoardsResolver {
  constructor(private boardsService: BoardsService) {}

  @Query(() => [Board])
  async fetchBoards(
    @Args('fetchBoardsInput') fetchBoardsInput: FetchBoardsInput,
  ): Promise<Board[]> {
    return this.boardsService.findAll(fetchBoardsInput);
  }
  @Query(() => Board)
  async fetchBoard(
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<Board> {
    return this.boardsService.findOne(id);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput,
  ): Promise<Board> {
    return this.boardsService.create(createBoardInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password') password: string,
  ): Promise<Board> {
    return this.boardsService.update(updateBoardInput, boardId, password);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
  ): Promise<boolean> {
    return this.boardsService.remove(boardId);
  }
}
