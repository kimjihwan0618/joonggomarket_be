import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UsedItemAddressInput {
  @Field({ nullable: true })
  zipcode: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  addressDetail: string;

  @Field(() => Float, { nullable: true })
  lat: number;

  @Field(() => Float, { nullable: true })
  lng: number;
}
