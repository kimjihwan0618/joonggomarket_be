import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Board } from './entity/board.entity';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { BoardAddress } from './entity/boardAddress.entity';
import * as log4js from 'log4js';
import { CreateBoardCommentInput } from './dto/createBoardComment.input';
import { BoardComment } from './entity/boardComment.entity';
import { UpdateBoardCommentInput } from './dto/updateBoardComment.input';
import { S3 } from '@aws-sdk/client-s3';
import { FileManagerService } from '../fileManager/fileManager.service';

@Injectable()
export class BoardService {
  private logger = log4js.getLogger(BoardService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
  private fileManagerService: FileManagerService;
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardAddress)
    private boardAddressRepository: Repository<BoardAddress>,

    @InjectRepository(BoardComment)
    private boardCommentRepository: Repository<BoardComment>,
  ) {
    this.s3 = new S3({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async fetchBoards(
    endDate: Date,
    startDate: Date,
    search: string,
    page: number,
  ): Promise<Board[]> {
    try {
      const query = this.boardRepository.createQueryBuilder('board');
      if (startDate && endDate) {
        query.andWhere('board.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }
      if (search) {
        query.andWhere('board.title LIKE :search', {
          search: `%${search}%`,
        });
      }
      const limit = 10; // 페이지당 10개의 결과
      const currentPage = page || 1; // page가 제공되지 않으면 1로 설정
      query.skip((currentPage - 1) * limit).take(limit);

      return query.getMany();
    } catch (error) {
      const msg = '게시글을 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchBoardsOfTheBest(): Promise<Board[]> {
    try {
      const query = this.boardRepository.createQueryBuilder('board');
      query.orderBy('board.likeCount', 'DESC').limit(4);

      return query.getMany();
    } catch (error) {
      const msg = '게시글 TOP 4를 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchBoardsCount(
    endDate: Date,
    startDate: Date,
    search: string,
  ): Promise<number> {
    try {
      const query = this.boardRepository.createQueryBuilder('board');
      if (startDate && endDate) {
        query.andWhere('board.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        });
      }
      if (search) {
        query.andWhere('board.title LIKE :search OR board.title LIKE :search', {
          search: `%${search}%`,
        });
      }

      return query.getCount();
    } catch (error) {
      const msg = '게시글 카운트를 조회하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async fetchBoard(_id: string): Promise<Board> {
    return this.boardRepository.findOne({
      where: { _id },
      relations: ['boardAddress'],
    });
  }

  async createBoard(createBoardInput: CreateBoardInput): Promise<Board> {
    return await this.boardRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const board = this.boardRepository.create({
            ...createBoardInput,
            boardAddress: createBoardInput.boardAddress,
          });
          this.logger.info(`-- 게시글 생성 : ${JSON.stringify(board)} --`);

          return await transactionalEntityManager.save(Board, board);
        } catch (error) {
          const msg = '게시글 생성하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async updateBoard(
    updateBoardInput: UpdateBoardInput,
    boardId: string,
    password: string,
  ): Promise<Board> {
    return await this.boardRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchBoard = await transactionalEntityManager.findOne(Board, {
            where: { _id: boardId, password },
            relations: ['boardAddress'],
          });

          if (!fetchBoard) {
            throw new NotFoundException('비밀번호가 잘못되었습니다.');
          }

          // s3에서 이미지 제거 및 업데이트
          const params = {
            Bucket: this.bucketName,
            Key: '',
          };
          for (let i = 0; i < 3; i++) {
            params.Key = fetchBoard.images[i]
              ? fetchBoard.images[i].slice(1)
              : 'none';
            await this.fileManagerService.deleteFile(
              params,
              fetchBoard.images[i],
              updateBoardInput.images[i],
            );
          }

          const updatedBoard = {
            ...fetchBoard,
            ...updateBoardInput,
            boardAddress: { ...updateBoardInput.boardAddress },
            updatedAt: new Date(),
          };
          this.logger.info(
            `-- 게시글 수정 : ${JSON.stringify(updatedBoard)} --`,
          );
          return await transactionalEntityManager.save(Board, updatedBoard);
        } catch (error) {
          const msg = '게시글 수정하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg); // 에러 발생 시 트랜잭션 롤백
        }
      },
    );
  }

  async deleteBoard(boardId: string, password: string): Promise<boolean> {
    try {
      if (!password) {
        throw new BadRequestException('올바른 요청이 아닙니다.');
      }
      const fetchBoard = await this.boardRepository.findOne({
        where: { _id: boardId, password },
      });
      const params = {
        Bucket: this.bucketName,
        Key: '',
      };
      for (let i = 0; i < fetchBoard.images.length; i++) {
        params.Key = fetchBoard.images[i]
          ? fetchBoard.images[i].slice(1)
          : 'none';
        await this.fileManagerService.deleteFile(params, 'DELETE_IMAGE', '');
      }
      if (!fetchBoard) {
        throw new NotFoundException('해당 게시글을 조회하는데 실패하였습니다.');
      }

      await this.boardAddressRepository.delete(boardId);
      return true;
    } catch (error) {
      const msg = '게시글 삭제하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async createBoardComment(
    createBoardCommentInput: CreateBoardCommentInput,
    boardId: string,
  ): Promise<BoardComment> {
    return await this.boardCommentRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const board = await transactionalEntityManager.findOne(Board, {
            where: { _id: boardId },
          });
          if (!board) {
            throw new Error('게시글을 찾을 수 없습니다.');
          }

          const boardComment = this.boardCommentRepository.create({
            ...createBoardCommentInput,
            board,
          });
          this.logger.info(
            `-- 게시글 댓글 생성 : ${JSON.stringify(boardComment)} --`,
          );

          return await transactionalEntityManager.save(
            BoardComment,
            boardComment,
          );
        } catch (error) {
          const msg = '게시글 댓글을 생성하는중 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async fetchBoardComments(
    page: number,
    boardId: string,
  ): Promise<BoardComment[]> {
    try {
      const query =
        this.boardCommentRepository.createQueryBuilder('board_comment');
      if (boardId) {
        query.andWhere('board_comment.board_id = :boardId', {
          boardId: `${boardId}`,
        });
      }
      const limit = 10;
      const currentPage = page || 1;
      query.skip((currentPage - 1) * limit).take(limit);

      return query.getMany();
    } catch (error) {
      const msg = '게시글 댓글을 조회하는중 에러가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async updateBoardComment(
    updateBoardCommentInput: UpdateBoardCommentInput,
    password: string,
    boardCommentId: string,
  ): Promise<BoardComment> {
    return await this.boardCommentRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchBoardComment = await transactionalEntityManager.findOne(
            BoardComment,
            {
              where: { _id: boardCommentId, password },
            },
          );

          if (!fetchBoardComment) {
            throw new NotFoundException('비밀번호를 확인해주세요.');
          }

          const updatedBoardComment = {
            ...fetchBoardComment,
            ...updateBoardCommentInput,
            updatedAt: new Date(),
          };
          const result = await transactionalEntityManager.save(
            BoardComment,
            updatedBoardComment,
          );
          return result;
        } catch (error) {
          const msg = '게시글 댓글 수정하는데 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async deleteBoardComment(
    boardCommentId: string,
    password: string,
  ): Promise<boolean> {
    try {
      const board = await this.boardCommentRepository.findOne({
        where: { _id: boardCommentId, password },
      });
      if (!board) {
        throw new NotFoundException('게시글을 조회하는데 실패하였습니다.');
      }
      await this.boardCommentRepository.delete(boardCommentId);
      return true;
    } catch (error) {
      const msg = '게시글 댓글 삭제하는데 오류가 발생하였습니다.';
      this.logger.error(msg + error);
      throw new InternalServerErrorException(msg);
    }
  }

  async likeBoard(boardId: string): Promise<number> {
    return await this.boardRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchBoard = await transactionalEntityManager.findOne(Board, {
            where: { _id: boardId },
          });

          if (!fetchBoard) {
            throw new NotFoundException('게시글을 조회하는데 실패하였습니다..');
          }

          const resultBoard = await transactionalEntityManager.save(Board, {
            ...fetchBoard,
            likeCount: fetchBoard.likeCount + 1,
          });

          this.logger.info(
            `-- 게시글 likeBoard ${resultBoard._id}: ${resultBoard.likeCount} --`,
          );
          return resultBoard.likeCount;
        } catch (error) {
          const msg = '게시글 좋아요 중에 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }

  async dislikeBoard(boardId: string): Promise<number> {
    return await this.boardRepository.manager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const fetchBoard = await transactionalEntityManager.findOne(Board, {
            where: { _id: boardId },
          });

          if (!fetchBoard) {
            throw new NotFoundException('게시글을 조회하는데 실패하였습니다..');
          }

          const resultBoard = await transactionalEntityManager.save(Board, {
            ...fetchBoard,
            dislikeCount: fetchBoard.dislikeCount + 1,
          });

          this.logger.info(
            `-- 게시글 dislikeBoard ${resultBoard._id}: ${resultBoard.dislikeCount} --`,
          );
          return resultBoard.dislikeCount;
        } catch (error) {
          const msg = '게시글 싫어요 중에 오류가 발생하였습니다.';
          this.logger.error(msg + error);
          throw new InternalServerErrorException(msg);
        }
      },
    );
  }
}
