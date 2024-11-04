import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateUseditemQuestionAnswerInput {
  @Field()
  contents: string;
}
