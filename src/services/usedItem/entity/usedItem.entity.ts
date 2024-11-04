import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Int } from '@nestjs/graphql';
import { UsedItemAddress } from './useditemAddress.entity';
import { UsedItemQuestion } from './useditemQuestion.entity';

@ObjectType()
@Entity('usedItem_list')
export class UsedItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  remarks: string;

  @Field()
  @Column()
  contents: string;

  @Field(() => Int)
  @Column()
  price: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  images: string[];

  @Field(() => Int)
  @Column({ default: 0 })
  pickedCount: number;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  soldAt: Date;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;

  @OneToOne(
    () => UsedItemAddress,
    (userItemAddress) => userItemAddress.usedItem,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn()
  @Field(() => UsedItemAddress, { nullable: true })
  usedItemAddress: UsedItemAddress;

  @OneToMany(() => UsedItemQuestion, (question) => question.usedItem, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Field(() => [UsedItemQuestion], { nullable: true })
  questions: UsedItemQuestion[];
}
