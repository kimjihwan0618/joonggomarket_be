import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { PointTransaction } from './entity/pointTransaction.entity';
import { PointTransactionService } from './pointTransaction.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '../user/entity/user.entity';
import { UsedItem } from '../usedItem/entity/usedItem.entity';

@Resolver(() => PointTransaction)
export class PointTransactionResolver {
  constructor(
    private pointTransactionService: PointTransactionService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PointTransaction)
  async createPointTransactionOfLoading(
    @Args('impUid', { type: () => ID }) impUid: string,
    @CurrentUser() user: User,
  ): Promise<PointTransaction> {
    return this.pointTransactionService.createPointTransactionOfLoading(
      impUid,
      user,
    );
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => PointTransaction)
  async createPointTransactionOfBuyingAndSelling(
    @Args('useritemId', { type: () => ID }) useritemId: string,
    @CurrentUser() buyer: User,
  ): Promise<UsedItem> {
    return this.pointTransactionService.createPointTransactionOfBuyingAndSelling(
      useritemId,
      buyer,
    );
  }
}
