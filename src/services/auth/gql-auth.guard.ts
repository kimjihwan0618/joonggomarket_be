// src/services/auth/gql-auth.guard.ts
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('로그인 후 이용 가능합니다.');
      // if (info && info.message === 'No auth token') {
      //   throw new UnauthorizedException('로그인 후 이용 가능합니다.');
      // } else {
      //   throw new UnauthorizedException('인증 정보 에러입니다.');
      // }
    }
    return user;
  }
}
