import { InputType, Field } from '@nestjs/graphql';
import { UsedItemAddressInput } from './usedItemAddress.input';

@InputType()
export class UpdateUseditemInput {
  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  remarks: string;

  @Field({ nullable: true })
  contents: string;

  @Field({ nullable: true })
  price: number;

  @Field(() => [String])
  tags: string[];

  @Field({ nullable: true })
  useditemAddress: UsedItemAddressInput;

  @Field(() => [String])
  images: string[];
}
