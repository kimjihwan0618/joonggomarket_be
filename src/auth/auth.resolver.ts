import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Token } from './dto/token.type';
import { Response } from 'express';
import { User } from '@/user/entity/user.entity';
import { GqlAuthGuard } from './gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

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
    @Context() context: { res: Response }, // Context에서 Response 객체를 받아옴
  ) {
    const user = await this.authService.validateUser(password, email);
    if (!user) {
      throw new Error('유저 정보가 잘못입력되었습니다.');
    }
    const token: Token = await this.authService.loginUser(user);
    context.res.cookie('myRefreshToken', token, {
      httpOnly: true, // JavaScript에서 접근 불가능
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용
      sameSite: 'strict', // CSRF 공격 방지
      maxAge: 24 * 60 * 60 * 1000, // 1일 동안 유효
    });
    return token;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async fetchUserLoggedIn(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
