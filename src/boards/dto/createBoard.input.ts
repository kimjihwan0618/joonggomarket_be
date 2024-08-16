import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field()
  title: string;

  @Field()
  contents: string;

  @Field()
  writer: string;

  @Field()
  password: string;
}
