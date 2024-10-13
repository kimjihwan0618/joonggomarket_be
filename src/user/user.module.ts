import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UsersResolver } from './user.resolver';
import { UserPoint } from './entity/userPoint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPoint])],
  providers: [UserService, UsersResolver],
  exports: [UserService],
})
export class UsersModule {}
