import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateBoardInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  contents: string;

  @Field({ nullable: true })
  youtubeUrl?: string;
}
