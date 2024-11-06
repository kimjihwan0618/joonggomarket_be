import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsedItem } from './entity/usedItem.entity';
import { Int } from '@nestjs/graphql';
import { UsedItemQuestion } from './entity/useditemQuestion.entity';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UseditemQuestionAnswer } from './entity/useditemQuestionAnswer.entity';
import { UsedItemService } from './useditem.service';
import { UpdateUseditemInput } from './dto/updateUsedItem.input';
import { CreateUseditemQuestionInput } from './dto/createUseditemQuestion.input';
import { UpdateUseditemQuestionInput } from './dto/updateUseditemQuestion.input';
import { CreateUseditemQuestionAnswerInput } from './dto/createUseditemQuestionAnswer.input';
import { UpdateUseditemQuestionAnswerInput } from './dto/updateUseditemQuestionAnswer.input';
import { CreateUseditemInput } from './dto/createUsedItem.input';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entity/user.entity';

@Resolver(() => UsedItem)
export class UsedItemResolver {
  constructor(private usedItemService: UsedItemService) {}

  @Query(() => UsedItem)
  async fetchUseditem(
    @Args('useditemId', { type: () => ID }) id: string,
  ): Promise<UsedItem> {
    return this.usedItemService.fetchUsedItem(id);
  }

  @Query(() => [UsedItem])
  async fetchUseditems(
    @Args('isSoldout', { nullable: true }) isSoldout: boolean,
    @Args('search', { nullable: true }) search: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditems(isSoldout, search, page);
  }

  // @Query(() => Int)
  // async fetchUseditemsCountIPicked(): Promise<number> {
  //   return this.usedItemService.fetchUseditemsCountIPicked();
  // }

  // @Query(() => Int)
  // async fetchUseditemsCountISold(): Promise<number> {
  //   return this.usedItemService.fetchUseditemsCountISold();
  // }

  @UseGuards(GqlAuthGuard)
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

  @Query(() => [UsedItem])
  async fetchUseditemsOfTheBest(): Promise<UsedItem[]> {
    return this.usedItemService.fetchUseditemsOfTheBest();
  }

  @Query(() => [UsedItemQuestion])
  async fetchUseditemQuestions(
    @Args('useditemId', { type: () => ID }) useditemId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UsedItemQuestion[]> {
    return this.usedItemService.fetchUseditemQuestions(useditemId, page);
  }

  @Query(() => [UseditemQuestionAnswer])
  async fetchUseditemQuestionAnswers(
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
    @Args('page', { type: () => Int, nullable: true }) page: number,
  ): Promise<UseditemQuestionAnswer[]> {
    return this.usedItemService.fetchUseditemQuestionAnswers(
      useditemQuestionId,
      page,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UsedItem)
  async createUseditem(
    @Args('createUseditemInput')
    createUseditemInput: CreateUseditemInput,
    @CurrentUser() user: User,
  ): Promise<UsedItem> {
    return this.usedItemService.createUseditem(createUseditemInput, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ID)
  async deleteUseditem(
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<string> {
    return this.usedItemService.deleteUseditem(useditemId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UsedItem)
  async updateUseditem(
    @Args('updateUseditemInput')
    updateUseditemInput: UpdateUseditemInput,
    @Args('useditemId', { type: () => ID }) useditemId: string,
  ): Promise<UsedItem> {
    return this.usedItemService.updateUseditem(updateUseditemInput, useditemId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Int)
  async toggleUseditemPick(
    @Args('useditemId', { type: () => ID }) useditemId: string,
    @CurrentUser() user: User,
  ): Promise<number> {
    return this.usedItemService.toggleUseditemPick(useditemId, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UsedItemQuestion)
  async createUseditemQuestion(
    @Args('createUseditemQuestionInput')
    createUseditemQuestionInput: CreateUseditemQuestionInput,
    @Args('useditemId', { type: () => ID }) useditemId: string,
    @CurrentUser() user: User,
  ): Promise<UsedItemQuestion> {
    return this.usedItemService.createUseditemQuestion(
      createUseditemQuestionInput,
      useditemId,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ID)
  async deleteUseditemQuestion(
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.usedItemService.deleteUseditemQuestion(
      useditemQuestionId,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UsedItemQuestion)
  async updateUseditemQuestion(
    @Args('updateUseditemQuestionInput')
    updateUseditemQuestionInput: UpdateUseditemQuestionInput,
    @Args('useditemQuestionId', { type: () => ID }) useditemQuestionId: string,
    @CurrentUser() user: User,
  ): Promise<UsedItemQuestion> {
    return this.usedItemService.updateUseditemQuestion(
      updateUseditemQuestionInput,
      useditemQuestionId,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UseditemQuestionAnswer)
  async createUseditemQuestionAnswer(
    @Args('createUseditemQuestionAnswerInput')
    createUseditemQuestionAnswerInput: CreateUseditemQuestionAnswerInput,
    @Args('useditemQuestionId', { type: () => ID })
    useditemQuestionId: string,
    @CurrentUser() user: User,
  ): Promise<UseditemQuestionAnswer> {
    return this.usedItemService.createUseditemQuestionAnswer(
      createUseditemQuestionAnswerInput,
      useditemQuestionId,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => ID)
  async deleteUseditemQuestionAnswer(
    @Args('useditemQuestionAnswerId', { type: () => ID })
    useditemQuestionAnswerId: string,
    @CurrentUser() user: User,
  ): Promise<string> {
    return this.usedItemService.deleteUseditemQuestionAnswer(
      useditemQuestionAnswerId,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => UseditemQuestionAnswer)
  async updateUseditemQuestionAnswer(
    @Args('updateUseditemQuestionAnswerInput')
    updateUseditemQuestionAnswerInput: UpdateUseditemQuestionAnswerInput,
    @Args('useditemQuestionId', { type: () => ID })
    useditemQuestionAnswerId: string,
  ): Promise<UseditemQuestionAnswer> {
    return this.usedItemService.updateUseditemQuestionAnswer(
      updateUseditemQuestionAnswerInput,
      useditemQuestionAnswerId,
    );
  }
}
