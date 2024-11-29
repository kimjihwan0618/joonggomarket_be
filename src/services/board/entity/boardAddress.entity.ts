import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';

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

  @OneToOne(() => Board, (board) => board.boardAddress, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  board: Board;
}
