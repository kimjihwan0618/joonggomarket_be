import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import * as log4js from 'log4js';
import { FileManager } from './entity/fileManager.entity';
import { ObjectCannedACL, S3 } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { format } from 'date-fns';

@Injectable()
export class FileManagerService {
  private logger = log4js.getLogger(FileManagerService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;

  constructor(
    @InjectRepository(FileManager)
    private fileManagerRepository: Repository<FileManager>,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadFile(file): Promise<FileManager> {
    const { filename, createReadStream, mimetype } = await file;
    const today = new Date();
    const datePath = format(today, 'yyyy/MM/dd'); // 날짜 포맷 설정
    const fileName = `${uuid()}-${filename}`; // UUID를 이용해 파일 이름 생성
    const s3Path = `${datePath}/${fileName}`; // S3에 저장할 경로

    return await this.fileManagerRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          // 파일 업로드
          const stream = createReadStream();
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks); // 스트림을 버퍼로 변환

          const params = {
            Bucket: this.bucketName,
            Key: s3Path,
            Body: buffer, // 파일 버퍼
            ContentType: mimetype, // MIME 타입
            ACL: ObjectCannedACL.public_read, // 공개 읽기 권한 설정
          };
          await this.s3.putObject(params);

          // 파일 정보 생성
          const fileManager = new FileManager();
          fileManager.url = s3Path;
          fileManager.size = buffer.length; // 파일 크기
          fileManager.isUsed = true;

          return await transactionalEntityManager.save(
            FileManager,
            fileManager,
          );
        } catch (error) {
          this.logger.error('uploadFile Error:', error);
        }
      },
    );
  }
}
