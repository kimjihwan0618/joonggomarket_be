import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateBoardCommentInput {
  @Field()
  contents: string;

  @Field()
  rating: number;
}
