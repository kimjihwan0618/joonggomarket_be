import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { BoardAddress } from './boardAddress.entity';
import { Int } from '@nestjs/graphql';
import { BoardComment } from './boardComment.entity';

@ObjectType()
@Entity('board_list')
export class Board {
  @OneToOne(() => BoardAddress, (boardAddress) => boardAddress.board, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Field(() => BoardAddress, { nullable: true })
  boardAddress: BoardAddress;

  @OneToMany(() => BoardComment, (comment) => comment.board)
  @Field(() => [BoardComment], { nullable: true })
  comments: BoardComment[];

  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  writer: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  contents: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  youtubeUrl: string;

  @Field(() => Int)
  @Column({ default: 0 })
  likeCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  dislikeCount: number;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  images: string[];

  @HideField()
  @Column()
  password: string;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  updatedAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;
}
