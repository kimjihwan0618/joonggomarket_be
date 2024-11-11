import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity('user_point')
export class UserPoint {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field(() => Int)
  @Column({ default: 0 })
  amount: number;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.userPoint, {
    onDelete: 'CASCADE',
  })
  user: User;
}
