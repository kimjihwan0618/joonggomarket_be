import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { UsedItemQuestion } from './useditemQuestion.entity';
import { User } from '@/services/user/entity/user.entity';

@ObjectType()
@Entity('useditem_question_answer')
export class UseditemQuestionAnswer {
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

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.question_answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;

  @Field(() => UsedItemQuestion)
  @ManyToOne(() => UsedItemQuestion, (question) => question.question_answers, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  useditem_question: UsedItemQuestion;
}
