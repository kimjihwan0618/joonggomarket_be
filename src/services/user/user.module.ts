import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { UserPoint } from './entity/userPoint.entity';
import { FileManagerModule } from '../fileManager/fileManager.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserPoint]), FileManagerModule],
  providers: [UserService, UserResolver],
  exports: [UserService],
})
export class UserModule {}
