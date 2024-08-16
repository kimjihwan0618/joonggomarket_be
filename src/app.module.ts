import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User } from './users/user.entity';
import { Board } from './boards/boards.entity';
import { UsersModule } from './users/users.module';
import { BoardsModule } from './boards/boards.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: databaseConfig().type,
      host: databaseConfig().host,
      port: databaseConfig().port,
      username: databaseConfig().username,
      password: databaseConfig().password,
      database: databaseConfig().database,
      entities: [User, Board],
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
    }),
    UsersModule,
    BoardsModule,
    AuthModule,
  ],
})
export class AppModule {}
