import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileManager } from './entity/fileManager.entity';
import { FileManagerService } from './fileManager.service';
import { FileManagerResolver } from './fileManager.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([FileManager])],
  providers: [FileManagerService, FileManagerResolver],
})
export class FileManagerModule {}
