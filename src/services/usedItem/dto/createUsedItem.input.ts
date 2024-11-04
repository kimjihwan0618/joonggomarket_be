import { InputType, Field } from '@nestjs/graphql';
import { UsedItemAddressInput } from './usedItemAddress.input';

@InputType()
export class CreateUseditemInput {
  @Field()
  name: string;

  @Field()
  remarks: string;

  @Field()
  contents: string;

  @Field()
  price: string;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  useditemAddress: UsedItemAddressInput;

  @Field(() => [String])
  images: string[];
}
