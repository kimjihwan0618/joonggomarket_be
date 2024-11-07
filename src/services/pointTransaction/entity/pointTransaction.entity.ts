import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Field, HideField, ID, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import { User } from '@/services/user/entity/user.entity';

@ObjectType()
@Entity()
export class PointTransaction {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field(() => ID, { nullable: true })
  @Column({ nullable: true })
  impUid: string;

  @Field(() => Int)
  @Column()
  amount: number;

  @Field(() => Int)
  @Column()
  balance: number;

  @Field()
  @Column()
  status: string; // 충전, 구매, 판매

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
  @ManyToOne(() => User, (user) => user.pointTransaction, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  user: User;
}
