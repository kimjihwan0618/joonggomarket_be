import { Resolver, Mutation, Args, ID } from '@nestjs/graphql';
import { PointTransaction } from './entity/pointTransaction.entity';
import { PointTransactionService } from './pointTransaction.service';

@Resolver(() => PointTransaction)
export class PointTransactionResolver {
  constructor(private pointTransactionService: PointTransactionService) {}

  @Mutation(() => PointTransaction)
  async createPointTransactionOfLoading(
    @Args('impUid', { type: () => ID }) impUid: string,
  ): Promise<PointTransaction> {
    return this.pointTransactionService.createPointTransactionOfLoading(impUid);
  }
}
