import { Field, ID, ObjectType } from '@nestjs/graphql';
// import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  // CreateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';

@ObjectType()
@Entity('board_address')
export class BoardAddress {
  // @OneToOne(() => Board, (board) => board, {
  //   onDelete: 'CASCADE',
  //   cascade: true,
  // })
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
