import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class BoardService {
  private logger = log4js.getLogger(BoardService.name);
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardAddress)
    private boardAddressRepository: Repository<BoardAddress>,

    @InjectRepository(BoardComment)
    private boardCommentRepository: Repository<BoardComment>,
  ) {}

  async fetchBoards(
    endDate: Date,
    startDate: Date,
    search: string,
    page: number,
  ): Promise<Board[]> {
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
  }

  async fetchBoardsOfTheBest(): Promise<Board[]> {
    const query = this.boardRepository.createQueryBuilder('board');

    query.orderBy('board.likeCount', 'DESC').limit(4);

    return query.getMany();
  }

  async fetchBoardsCount(
    endDate: Date,
    startDate: Date,
    search: string,
  ): Promise<number> {
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
          this.logger.error(`-- 게시글 생성 Error: ${error} --`);
          throw error;
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
            throw new NotFoundException('Board not found');
          }

          const { boardAddress, ...selectBoard } = fetchBoard;
          const { title, contents, youtubeUrl, images } = updateBoardInput;
          const { zipcode, address, addressDetail } =
            updateBoardInput.boardAddress;
          const resultBoard = await transactionalEntityManager.save(Board, {
            ...selectBoard,
            title,
            contents,
            youtubeUrl,
            images,
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
          this.logger.error(`-- 게시글 수정 Error: ${error} --`);
          throw error; // 에러 발생 시 트랜잭션 롤백
        }
      },
    );
  }

  async deleteBoard(boardId: string): Promise<boolean> {
    const board = await this.boardAddressRepository.findOne({
      where: { _id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    await this.boardAddressRepository.delete(boardId);
    return true;
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
          this.logger.error(`-- 게시글 댓글 생성 Error: ${error} --`);
          throw error;
        }
      },
    );
  }

  async fetchBoardComments(
    page: number,
    boardId: string,
  ): Promise<BoardComment[]> {
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
            throw new NotFoundException('Board Comment not found');
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
          throw error;
        }
      },
    );
  }
}
