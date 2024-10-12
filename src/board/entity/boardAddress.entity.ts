import { Field, ID, ObjectType } from '@nestjs/graphql';
// import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  // CreateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('board_address')
export class BoardAddress {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  zipcode: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  addressDetail: string;
}
