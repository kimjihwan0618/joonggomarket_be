import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Token } from './dto/token.type';
import { Response, Request } from 'express';
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
    const token = await this.authService.loginUser(password, email);
    const result = new Token();
    result.accessToken = token.accessToken;
    context.res.cookie('myRefreshToken', token.myRefreshToken, {
      httpOnly: true, // JavaScript에서 접근 불가능
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용
      sameSite: 'strict', // CSRF 공격 방지
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1주일 동안 유효
      // maxAge: 24 * 60 * 60 * 1000, // 1일 동안 유효
    });
    return result;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async logoutUser(@Context() context: { req: Request; res: Response }) {
    const myRefreshToken = context.req.cookies['myRefreshToken'];
    await this.authService.logoutUser(myRefreshToken);
    // 쿠키에서 myRefreshToken 제거
    context.res.clearCookie('myRefreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return true;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async fetchUserLoggedIn(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
