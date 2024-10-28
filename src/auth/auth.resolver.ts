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
  async restoreAccessToken(
    @Context() context: { req: Request; res: Response },
  ) {
    const myRefreshToken = context.req.cookies['myRefreshToken'];
    const token = await this.authService.restoreAccessToken(myRefreshToken);
    const result = new Token();
    result.accessToken = token?.accessToken;
    context.res.cookie('myRefreshToken', token?.myRefreshToken || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: token ? 7 * 24 * 60 * 60 * 1000 : 0,
      // maxAge: token ? 60 * 60 * 1000 : 0,
    });
    return result;
  }

  @Mutation(() => Token)
  async loginUser(
    @Args('password') password: string,
    @Args('email') email: string,
    @Context() context: { res: Response }, // Context에서 Response 객체를 받아옴
  ) {
    const token = await this.authService.loginUser(password, email);
    const result = new Token();
    result.accessToken = token?.accessToken;
    context.res.cookie('myRefreshToken', token?.myRefreshToken || '', {
      httpOnly: true, // JavaScript에서 접근 불가능
      secure: process.env.NODE_ENV === 'production', // HTTPS에서만 사용
      sameSite: 'strict', // CSRF 공격 방지
      maxAge: token ? 7 * 24 * 60 * 60 * 1000 : 0, // 1주일 동안 유효
      // maxAge: token ? 60 * 60 * 1000 : 0, // 1분 동안 유효
    });
    return result;
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Boolean)
  async logoutUser(@Context() context: { req: Request; res: Response }) {
    const accessToken = context.req.headers['authorization']?.split(' ')[1];
    const result: boolean = await this.authService.logoutUser(accessToken);
    // 쿠키에서 myRefreshToken 제거
    context.res.clearCookie('myRefreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return result;
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User)
  async fetchUserLoggedIn(@CurrentUser() user: User): Promise<User> {
    return user;
  }
}
