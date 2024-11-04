import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUseditemQuestionAnswerInput {
  @Field()
  contents: string;
}
