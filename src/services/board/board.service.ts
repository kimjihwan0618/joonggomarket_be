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
import { DeleteObjectCommand, S3 } from '@aws-sdk/client-s3';

@Injectable()
export class BoardService {
  private logger = log4js.getLogger(BoardService.name);
  private s3: S3;
  private bucketName: string = process.env.AWS_S3_BUCKET;
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
        query.andWhere('board.title LIKE :search OR board.title LIKE :search', {
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
          const boardAddress = createBoardInput.boardAddress
            ? await transactionalEntityManager.save(
                BoardAddress,
                createBoardInput.boardAddress,
              )
            : null;
          const board = this.boardRepository.create({
            ...createBoardInput,
            boardAddress,
            _id: boardAddress?._id,
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

          const { boardAddress, ...selectBoard } = fetchBoard;
          const { title, contents, youtubeUrl, images } = updateBoardInput;
          const { zipcode, address, addressDetail } =
            updateBoardInput.boardAddress;

          // s3에서 이미지 제거 및 업데이트
          const params = {
            Bucket: this.bucketName,
            Key: '',
          };
          for (let i = 0; i < 3; i++) {
            params.Key = selectBoard.images[i].slice(1);
            const command = new DeleteObjectCommand(params);
            if (images[i] === '' && selectBoard.images[i] !== '') {
              const result = await this.s3.send(command);
              this.logger.info(
                `S3 이미지 파일 삭제 (${result.$metadata.httpStatusCode}): ${selectBoard.images[i]}`,
              );
            }
            if (
              images[i] !== '' &&
              images[i] !== selectBoard.images[i] &&
              selectBoard.images[i] !== ''
            ) {
              const result = await this.s3.send(command);
              this.logger.info(
                `S3 이미지 파일 삭제 (${result.$metadata.httpStatusCode}): ${selectBoard.images[i]}`,
              );
            }
          }

          const resultBoard = await transactionalEntityManager.save(Board, {
            ...selectBoard,
            title,
            contents,
            youtubeUrl,
            images,
            updatedAt: new Date(),
          });
          const resultBoardAddress = await transactionalEntityManager.save(
            BoardAddress,
            {
              ...boardAddress,
              zipcode,
              address,
              addressDetail,
            },
          );
          const updatedBoard = {
            ...resultBoard,
            boardAddress: { ...resultBoardAddress },
          };
          this.logger.info(
            `-- 게시글 수정 : ${JSON.stringify(updatedBoard)} --`,
          );
          return updatedBoard;
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
      const board = await this.boardRepository.findOne({
        where: { _id: boardId, password },
      });
      if (!board) {
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
            throw new NotFoundException(
              '해당 게시글 댓글을 조회하는데 실패하였습니다.',
            );
          }

          const { contents, rating } = updateBoardCommentInput;
          const updatedBoardComment = {
            ...fetchBoardComment,
            contents,
            rating,
            updatedAt: new Date(),
          };
          const result = await transactionalEntityManager.save(
            BoardComment,
            updatedBoardComment,
          );
          return result;
        } catch (error) {
          this.logger.error(`-- 게시글 댓글 수정 Error: ${error} --`);
          throw new InternalServerErrorException(
            '게시글 댓글 수정 중 오류가 발생하였습니다.',
          );
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
      this.logger.error(`-- 게시글 댓글 삭제 Error: ${error} --`);
      throw new InternalServerErrorException(
        '게시글 댓글 삭제 중 오류가 발생하였습니다.',
      );
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

          const { ...selectBoard } = fetchBoard;
          const resultBoard = await transactionalEntityManager.save(Board, {
            ...selectBoard,
            likeCount: selectBoard.likeCount + 1,
          });

          this.logger.info(
            `-- 게시글 likeBoard ${resultBoard._id}: ${resultBoard.likeCount} --`,
          );
          return resultBoard.likeCount;
        } catch (error) {
          this.logger.error(`-- 게시글 likeBoard Error: ${error} --`);
          throw new InternalServerErrorException(
            '게시글 좋아요 중에 오류가 발생하였습니다.',
          );
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

          const { ...selectBoard } = fetchBoard;
          const resultBoard = await transactionalEntityManager.save(Board, {
            ...selectBoard,
            dislikeCount: selectBoard.dislikeCount + 1,
          });

          this.logger.info(
            `-- 게시글 dislikeBoard ${resultBoard._id}: ${resultBoard.dislikeCount} --`,
          );
          return resultBoard.dislikeCount;
        } catch (error) {
          this.logger.error(`-- 게시글 dislikeBoard Error: ${error} --`);
          throw new InternalServerErrorException(
            '게시글 싫어요 중에 오류가 발생하였습니다.',
          );
        }
      },
    );
  }
}
