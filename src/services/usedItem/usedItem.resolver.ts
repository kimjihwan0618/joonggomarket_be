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

  @Query(() => [UsedItem])
  async fetchUseditemsIPicked(
    @Args('search', { nullable: true }) search: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditemsIPicked(search, page);
  }

  @Query(() => [UsedItem])
  async fetchUseditemsISold(
    @Args('search', { nullable: true }) search: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditemsISold(search, page);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [UsedItem])
  async fetchUseditemsOfTheBest(): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditemsOfTheBest();
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async fetchUseditemQuestions(
    @Args('useditemId', { type: () => ID }) useditemId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<boolean> {
    return this.usedItemService.fetchUseditemQuestions(useditemId, page);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => BoardComment)
  async fetchUseditemQuestionAnswers(
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<BoardComment> {
    return this.usedItemService.fetchUseditemQuestionAnswers(
      page,
      useditemQuestionId,
    );
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
