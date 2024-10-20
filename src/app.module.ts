import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User } from './user/entity/user.entity';
import { Board } from './board/entity/board.entity';
import { UserModule } from './user/user.module';
import { BoardModule } from './board/board.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';
import { BoardAddress } from './board/entity/boardAddress.entity';
import { UserPoint } from './user/entity/userPoint.entity';

const { type, host, port, username, password, database } = databaseConfig();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type,
      host,
      port,
      username,
      password,
      database,
      entities: [User, Board, BoardAddress, UserPoint],
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req, res }) => ({ req, res }), // req와 res를 context에 추가
    }),
    UserModule,
    BoardModule,
    AuthModule,
  ],
})
export class AppModule {}
