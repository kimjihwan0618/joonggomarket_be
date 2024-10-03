import { InputType, Field } from '@nestjs/graphql';
import { BoardAddressInput } from './boardAddress.input';

@InputType()
export class UpdateBoardInput {
  @Field({ nullable: true })
  title: string;

  @Field({ nullable: true })
  contents: string;

  @Field({ nullable: true })
  youtubeUrl: string;

  @Field({ nullable: true })
  boardAddress: BoardAddressInput;

  @Field(() => [String], { nullable: true })
  images: string[];
}
