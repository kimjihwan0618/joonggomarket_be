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

@ObjectType()
@Entity('usedItem_question')
export class UsedItemQuestion {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  contents: string;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamp', default: () => 'NOW()' })
  updatedAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;

  @HideField()
  @ManyToOne(() => UsedItem, (usedItem) => usedItem.questions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  usedItem: UsedItem;

  @OneToMany(
    () => UseditemQuestionAnswer,
    (questionAnswer) => questionAnswer.question,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @Field(() => [UsedItemQuestion], { nullable: true })
  questionAnswers: UseditemQuestionAnswer[];
}
