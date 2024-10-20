import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Board } from './board.entity';

@ObjectType()
@Entity('board_address')
export class BoardAddress {
  @OneToOne(() => Board, (board) => board.boardAddress, {
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
