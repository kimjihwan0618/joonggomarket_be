import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { BoardService } from './usedItem.service';
import { Board, UsedItem } from './entity/usedItem.entity';
import { GraphQLDateTime } from 'graphql-scalars';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { Int } from '@nestjs/graphql';
import { CreateBoardCommentInput } from './dto/createBoardComment.input';
import {
  BoardComment,
  UsedItemQuestion,
} from './entity/useditemQuestion.entity';
import { UpdateBoardCommentInput } from './dto/updateBoardComment.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';

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
  @Mutation(() => [UsedItemQuestion])
  async fetchUseditemQuestions(
    @Args('useditemId', { type: () => ID }) useditemId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItemQuestion[]> {
    return this.usedItemService.fetchUseditemQuestions(useditemId, page);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => [UseditemQuestionAnswer])
  async fetchUseditemQuestionAnswers(
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UseditemQuestionAnswer[]> {
    return this.usedItemService.fetchUseditemQuestionAnswers(
      page,
      useditemQuestionId,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => BoardComment)
  async createUseditem(
    @Args('createUseditemInput')
    createUseditemInput: CreateUseditemInput,
  ): Promise<BoardComment> {
    return this.usedItemService.createUseditemInput(createUseditemInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ID)
  async deleteUseditem(
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<string> {
    return this.usedItemService.deleteUseditem(useditemId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async updateUseditem(
    @Args('createUseditemInput')
    createUseditemInput: CreateUseditemInput,
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<number> {
    return this.usedItemService.updateUseditem(createUseditemInput, useditemId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async toggleUseditemPick(
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<number> {
    return this.usedItemService.toggleUseditemPick(useditemId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async createUseditemQuestion(
    @Args('createUseditemQuestionInput')
    createUseditemQuestionInput: CreateUseditemQuestionInput,
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<number> {
    return this.usedItemService.createUseditemQuestion(
      createUseditemQuestionInput,
      useditemId,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async deleteUseditemQuestion(
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
  ): Promise<number> {
    return this.usedItemService.useditemQuestionId(useditemQuestionId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async updateUseditemQuestion(
    @Args('createUseditemQuestionInput')
    updateUseditemQuestionInput: UpdateUseditemQuestionInput,
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
  ): Promise<number> {
    return this.usedItemService.updateUseditemQuestion(
      updateUseditemQuestionInput,
      useditemQuestionId,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async deleteUseditemQuestionAnswer(
    @Args('useditemQuestionAnswerId', { type: () => ID })
    useditemQuestionAnswerId: string,
  ): Promise<number> {
    return this.usedItemService.deleteUseditemQuestionAnswer(
      useditemQuestionAnswerId,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async updateUseditemQuestionAnswer(
    @Args('createUseditemQuestionInput')
    updateUseditemQuestionAnswerInput: UpdateUseditemQuestionAnswerInput,
    @Args('useditemQuestionId', { type: () => ID })
    useditemQuestionAnswerId: string,
  ): Promise<number> {
    return this.usedItemService.updateUseditemQuestionAnswer(
      updateUseditemQuestionAnswerInput,
      useditemQuestionAnswerId,
    );
  }
}
