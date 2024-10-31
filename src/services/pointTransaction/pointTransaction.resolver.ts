import { Resolver, Mutation, Args, ID, Context } from '@nestjs/graphql';
import { PointTransaction } from './entity/pointTransaction.entity';
import { PointTransactionService } from './pointTransaction.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { JwtService } from '@nestjs/jwt';

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
    @Context() context: { req: Request; res: Response },
  ): Promise<PointTransaction> {
    const accessToken = context.req.headers['authorization']?.split(' ')[1];
    const { _id } = this.jwtService.decode(accessToken) as any;
    return this.pointTransactionService.createPointTransactionOfLoading(
      impUid,
      _id,
    );
  }
}
