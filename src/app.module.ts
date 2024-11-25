import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { User } from './services/user/entity/user.entity';
import { Board } from './services/board/entity/board.entity';
import { UserModule } from './services/user/user.module';
import { BoardModule } from './services/board/board.module';
import { AuthModule } from './services/auth/auth.module';
import { BoardAddress } from './services/board/entity/boardAddress.entity';
import { UserPoint } from './services/user/entity/userPoint.entity';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { ConfigModule } from '@nestjs/config';
import { BoardComment } from './services/board/entity/boardComment.entity';
import { FileManager } from './services/fileManager/entity/fileManager.entity';
import { FileManagerModule } from './services/fileManager/fileManager.module';
import { PointTransaction } from './services/pointTransaction/entity/pointTransaction.entity';
import { PointTransactionModule } from './services/pointTransaction/pointTransaction.module';
import { UsedItem } from './services/usedItem/entity/usedItem.entity';
import { UsedItemAddress } from './services/usedItem/entity/useditemAddress.entity';
import { UsedItemQuestion } from './services/usedItem/entity/useditemQuestion.entity';
import { UseditemQuestionAnswer } from './services/usedItem/entity/useditemQuestionAnswer.entity';
import { UsedItemModule } from './services/usedItem/useditem.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
      envFilePath: `.env.${process.env.NODE_ENV}`,
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
      entities: [
        Board,
        BoardAddress,
        BoardComment,
        UsedItem,
        UsedItemAddress,
        UsedItemQuestion,
        UseditemQuestionAnswer,
        User,
        UserPoint,
        FileManager,
        PointTransaction,
      ],
      synchronize: true,
      logging: true,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      csrfPrevention: false,
      playground: true, // 배포 환경에서는 명시적으로 입력
      introspection: true, // 배포 환경에서는 명시적으로 입력
      context: ({ req, res }) => ({ req, res }),
    }),
    RedisModule.forRoot({
      config: {
        host: process.env.REDIS_HOST, // 로컬 Redis 서버 주소
        port: Number(process.env.REDIS_PORT), // Redis 서버 포트
      },
    }),
    UserModule,
    UsedItemModule,
    BoardModule,
    AuthModule,
    FileManagerModule,
    PointTransactionModule,
  ],
})
export class AppModule {}
