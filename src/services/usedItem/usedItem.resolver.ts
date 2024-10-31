import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardService } from './usedItem.service';
import { Board, UsedItem } from './entity/usedItem.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Int } from '@nestjs/graphql';
import { CreateBoardCommentInput } from './dto/createBoardComment.input';
import { BoardComment } from './entity/useditemQuestion.entity';
import { UpdateBoardCommentInput } from './dto/updateBoardComment.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';

@Resolver(() => UsedItem)
export class UsedItemResolver {
  constructor(private usedItemService: UsedItemService) {}

  @Query(() => [UsedItem])
  async fetchUseditems(
    @Args('isSoldout', { nullable: true }) isSoldout: boolean,
    @Args('search', { nullable: true }) search: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditems(isSoldout, search, page);
  }

  @Query(() => UsedItem)
  async fetchUsedItem(
    @Args('useditemId', { type: () => ID }) id: string,
  ): Promise<UsedItem> {
    return this.usedItemService.fetchUsedItem(id);
  }

  @Query(() => [Board])
  async fetchBoardsOfTheBest(): Promise<Board[]> {
    return this.boardService.fetchBoardsOfTheBest();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async createBoard(
    @Args('createBoardInput') createBoardInput: CreateBoardInput,
  ): Promise<Board> {
    return this.boardService.createBoard(createBoardInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async updateBoard(
    @Args('updateBoardInput') updateBoardInput: UpdateBoardInput,
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<Board> {
    return this.boardService.updateBoard(updateBoardInput, boardId, password);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteBoard(
    @Args('boardId', { type: () => ID }) boardId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<boolean> {
    return this.boardService.deleteBoard(boardId, password);
  }

  @UseGuards(GqlAuthGuard)
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

  @UseGuards(GqlAuthGuard)
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async deleteBoardComment(
    @Args('boardCommentId', { type: () => ID }) boardCommentId: string,
    @Args('password', { type: () => String, nullable: true }) password: string,
  ): Promise<boolean> {
    return this.boardService.deleteBoardComment(boardCommentId, password);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async likeBoard(
    @Args('boardId', { type: () => ID }) id: string,
  ): Promise<number> {
    return this.boardService.likeBoard(id);
  }
}
