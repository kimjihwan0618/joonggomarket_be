import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Board } from './usedItem.entity';

@ObjectType()
@Entity('board_comment')
export class UseditemQuestionAnswer {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  writer: string;

  @HideField()
  @Field()
  @Column()
  password: string;

  @Field()
  @Column()
  contents: string;

  @Field()
  @Column('float')
  rating: number;

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
  @ManyToOne(() => Board, (board) => board.comments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  board: Board;
}
