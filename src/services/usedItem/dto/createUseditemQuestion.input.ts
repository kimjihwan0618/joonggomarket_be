import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUseditemQuestionInput {
  @Field()
  contents: string;
}
