import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User } from './user/entity/user.entity';
import { Board } from './board/entity/board.entity';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import { BoardAddress } from './board/entity/boardAddress.entity';
import { UserPoint } from './user/entity/userPoint.entity';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { BoardComment } from './board/entity/boardComment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
      // cache: true,
      envFilePath: `src/config/env/.${process.env.NODE_ENV}.env`,
    }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as
        | 'mysql'
        | 'mariadb'
        | 'postgres'
        | 'sqlite'
        | 'mssql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Board, BoardAddress, BoardComment, User, UserPoint],
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST, // 로컬 Redis 서버 주소
        port: Number(process.env.REDIS_PORT), // Redis 서버 포트
      },
    }),
    UserModule,
    BoardModule,
    AuthModule,
  ],
})
export class AppModule {}
