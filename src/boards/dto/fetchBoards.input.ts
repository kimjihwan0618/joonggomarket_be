import { InputType, Field, Int } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

@InputType()
export class FetchBoardsInput {
  @Field(() => GraphQLDateTime, { nullable: true })
  startDate?: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  search?: string;

  @Field(() => Int, { nullable: true })
  page?: number;
}
