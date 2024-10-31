import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class BoardAddressInput {
  @Field({ nullable: true })
  zipcode: string;

  @Field({ nullable: true })
  address: string;

  @Field({ nullable: true })
  addressDetail: string;
}
