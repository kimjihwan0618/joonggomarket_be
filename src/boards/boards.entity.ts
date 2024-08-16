import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity('boards')
export class Board {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  _id: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column()
  contents: string;

  @Field()
  @Column()
  password: string;

  @Field({ nullable: true }) // GraphQL에서 선택적 필드로 설정
  @Column({ nullable: true }) // TypeORM에서 NULL 값을 허용하도록 설정
  youtubeUrl?: string; // 선택적 필드

  @Field(() => GraphQLDateTime)
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
