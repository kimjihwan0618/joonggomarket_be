import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Board } from './board.entity';

@ObjectType()
@Entity('board_address')
export class BoardAddress {
  @ManyToOne(() => Board, (board) => board.boardAddress, {
    onDelete: 'CASCADE',
  })
  board: Board;

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
