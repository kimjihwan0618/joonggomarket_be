import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { BoardAddress } from './boardAddress.entity';
import { Int } from '@nestjs/graphql';

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

  @Field({ nullable: true }) // GraphQL에서 선택적 필드로 설정
  @Column({ nullable: true }) // TypeORM에서 NULL 값을 허용하도록 설정
  youtubeUrl: string; // 선택적 필드

  @Field(() => Int)
  @Column({ default: 0 })
  likeCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  disklikeCount: number;

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
