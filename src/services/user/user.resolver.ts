import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entity/user.entity';
import { UpdateUserInput } from './dto/updateUser.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.userService.createUser(createUserInput);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => User)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() user: User,
  ): Promise<User> {
    return this.userService.updateUser(updateUserInput, user);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async resetUserPassword(
    @Args('password') newPassword: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.userService.resetUserPassword(newPassword, user);
  }
}
