import { InputType, Field } from '@nestjs/graphql';
import { BoardAddressInput } from './boardAddress.input';

@InputType()
export class CreateBoardInput {
  @Field()
  writer: string;

  @Field()
  password: string;

  @Field()
  title: string;

  @Field()
  contents: string;

  @Field({ nullable: true })
  youtubeUrl: string;

  @Field({ nullable: true })
  boardAddress: BoardAddressInput;

  @Field(() => [String], { nullable: true })
  images: string[];
}
