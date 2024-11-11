import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { UsedItem } from './usedItem.entity';
import { UseditemQuestionAnswer } from './useditemQuestionAnswer.entity';
import { User } from '@/services/user/entity/user.entity';

@ObjectType()
@Entity('useditem_question')
export class UsedItemQuestion {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  contents: string;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true, default: null })
  deletedAt: Date;

  @Field(() => UsedItem)
  @ManyToOne(() => UsedItem, (useditem) => useditem.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  useditem: UsedItem;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @OneToMany(
    () => UseditemQuestionAnswer,
    (question_answers) => question_answers.useditem_question,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @HideField()
  question_answers: UseditemQuestionAnswer[];
}
