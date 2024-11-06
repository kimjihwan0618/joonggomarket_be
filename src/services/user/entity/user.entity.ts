import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { UserPoint } from './userPoint.entity';
import { PointTransaction } from '@/services/pointTransaction/entity/pointTransaction.entity';
import { UsedItem } from '@/services/usedItem/entity/usedItem.entity';

@ObjectType()
@Entity('user_list')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  picture: string;

  @HideField()
  @Column()
  password: string;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamp', default: () => 'NOW()' })
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  @Column({ type: 'timestamp', default: () => 'NOW()' })
  updatedAt: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  @Column({ type: 'timestamp', nullable: true, default: null })
  deletedAt: Date;

  @OneToMany(
    () => PointTransaction,
    (pointTransaction) => pointTransaction.user,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @HideField()
  pointTransaction: PointTransaction[];

  @JoinTable()
  @ManyToMany(() => UsedItem, (usedItem) => usedItem.pickers, {
    cascade: true,
  })
  @HideField()
  picked_useditems: UsedItem[];

  @OneToOne(() => UsedItem, (usedItem) => usedItem.buyer, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @HideField()
  buyed_useditem: UsedItem;

  @OneToMany(() => UsedItem, (usedItem) => usedItem.seller, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @HideField()
  sold_useditem: UsedItem;

  @OneToOne(() => UserPoint, (userPoint) => userPoint.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @Field(() => UserPoint, { nullable: true })
  userPoint: UserPoint;
}
