import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardService } from './board.service';
import { Board } from './entity/board.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Int } from '@nestjs/graphql';
import { CreateBoardCommentInput } from './dto/createBoardComment.input';
import { BoardComment } from './entity/boardComment.entity';
import { UpdateBoardCommentInput } from './dto/updateBoardComment.input';

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
    return this.boardService.fetchBoards(endDate, startDate, search, page);
  }

  @Query(() => [Board])
  async fetchBoardsOfTheBest(): Promise<Board[]> {
    return this.boardService.fetchBoardsOfTheBest();
  }

  @Query(() => Int)
  async fetchBoardsCount(
    @Args('endDate', { type: () => GraphQLDateTime, nullable: true })
    endDate: Date,
    @Args('startDate', { type: () => GraphQLDateTime, nullable: true })
    startDate: Date,
    @Args('search', { nullable: true }) search: string,
  ): Promise<number> {
    return this.boardService.fetchBoardsCount(endDate, startDate, search);
  }

  @Query(() => Board)
  async fetchBoard(
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<Board> {
    return this.boardService.fetchBoard(id);
  }

  // @UseGuards(GqlAuthGuard) // jwt 인증시 필요 어노테이션
  @Mutation(() => Board)
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput,
  ): Promise<Board> {
    return this.boardService.createBoard(createBoardInput);
  }

  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<Board> {
    return this.boardService.updateBoard(updateBoardInput, boardId, password);
  }

  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<boolean> {
    return this.boardService.deleteBoard(boardId, password);
  }

  @Mutation(() => BoardComment)
  async createBoardComment(
    @Args('createBoardCommentInput')
    createBoardCommentInput: CreateBoardCommentInput,
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<BoardComment> {
    return this.boardService.createBoardComment(createBoardCommentInput, id);
  }

  @Query(() => [BoardComment])
  async fetchBoardComments(
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<BoardComment[]> {
    return this.boardService.fetchBoardComments(page, id);
  }

  @Mutation(() => BoardComment)
  async updateBoardComment(
    @Args('updateBoardCommentInput')
    updateBoardCommentInput: UpdateBoardCommentInput,
    @Args('password', { type: () => String, nullable: true }) password: string,
    @Args('boardCommentId', { type: () => ID }) id: string,
  ): Promise<BoardComment> {
    return this.boardService.updateBoardComment(
      updateBoardCommentInput,
      password,
      id,
    );
  }

  @Mutation(() => Boolean)
  async deleteBoardComment(
    @Args('boardCommentId', { type: () => ID }) boardCommentId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<boolean> {
    return this.boardService.deleteBoardComment(boardCommentId, password);
  }
}
