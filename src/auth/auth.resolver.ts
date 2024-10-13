import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Token } from './dto/token.type';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => Token)
  async loginUser(
    @Args('password') password: string,
    @Args('email') email: string,
  ) {
    const user = await this.authService.validateUser(password, email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return this.authService.loginUser(user);
  }
}
