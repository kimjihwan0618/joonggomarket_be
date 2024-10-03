import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './user.service';
import { CreateUserInput } from './dto/createUser.input';
import { User } from './entity/user.entity';

@Resolver(() => User)
export class UsersResolver {
  constructor(private usersService: UsersService) {}

  @Mutation(() => User)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.create(createUserInput);
  }
}
