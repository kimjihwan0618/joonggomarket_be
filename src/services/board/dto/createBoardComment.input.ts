import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoardCommentInput {
  @Field()
  writer: string;

  @Field()
  password: string;

  @Field()
  contents: string;

  @Field()
  rating: number;
}
