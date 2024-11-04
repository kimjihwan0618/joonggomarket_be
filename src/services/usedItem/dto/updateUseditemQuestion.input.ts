import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUseditemQuestionInput {
  @Field()
  contents: string;
}
