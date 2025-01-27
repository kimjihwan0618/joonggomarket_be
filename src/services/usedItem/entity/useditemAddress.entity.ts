import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { UsedItem } from './usedItem.entity';

@ObjectType()
@Entity('useditem_address')
export class UsedItemAddress {
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

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  lat: number;

  @Field(() => Float, { nullable: true })
  @Column('float', { nullable: true })
  lng: number;

  @OneToOne(() => UsedItem, (usedItem) => usedItem.useditemAddress, {
    onDelete: 'CASCADE',
  })
  usedItem: UsedItem;
}
