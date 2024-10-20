import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlCtx = GqlExecutionContext.create(ctx); // GraphQL 컨텍스트 생성
    const request = gqlCtx.getContext().req; // 요청 객체 가져오기
    return request.user; // JWT 검증 후 request.user에 저장된 유저 정보 반환
  },
);
