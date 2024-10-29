import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { FileManagerService } from './fileManager.service';
import { FileManager } from './entity/fileManager.entity';
import { FileUpload, Upload } from 'graphql-upload';

@Resolver(() => FileManager)
export class FileManagerResolver {
  constructor(private fileManagerService: FileManagerService) {}

  @Mutation(() => FileManager)
  async uploadFile(
    @Args('file', { type: () => Upload }) file: FileUpload,
  ): Promise<FileManager> {
    return this.fileManagerService.uploadFile(file);
  }
}