import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as log4js from 'log4js';
import { FileManager } from './entity/fileManager.entity';
import { FileUpload } from 'graphql-upload';

@Injectable()
export class FileManagerService {
  private logger = log4js.getLogger(FileManagerService.name);
  constructor(
    @InjectRepository(FileManager)
    private fileManagerRepository: Repository<FileManager>,
  ) {}

  async uploadFile(file: FileUpload): Promise<FileManager> {
    const { filename, mimetype, encoding, createReadStream } = file;
    return new FileManager();
  }
}
