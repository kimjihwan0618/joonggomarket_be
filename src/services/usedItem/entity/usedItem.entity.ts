import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Int } from '@nestjs/graphql';
import { UsedItemAddress } from './useditemAddress.entity';
import { UsedItemQuestion } from './useditemQuestion.entity';
import { User } from '@/services/user/entity/user.entity';

@ObjectType()
@Entity('useditem_list')
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
  price: number;

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
  useditemAddress: UsedItemAddress;

  @Field(() => User, { nullable: true })
  @JoinColumn()
  @ManyToOne(() => User, (user) => user.buyed_useditem, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  buyer: User;

  @Field(() => User)
  @JoinColumn()
  @ManyToOne(() => User, (user) => user.sold_useditem, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  seller: User;

  @HideField()
  @ManyToMany(() => User, (user) => user.picked_useditems)
  pickers: User[];

  @OneToMany(() => UsedItemQuestion, (question) => question.useditem, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Field(() => [UsedItemQuestion], { nullable: true })
  questions: UsedItemQuestion[];
}
