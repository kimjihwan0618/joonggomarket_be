import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entity/board.entity';
import { CreateBoardInput } from './dto/createBoard.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { BoardAddress } from './entity/boardAddress.entity';
import * as log4js from 'log4js';

@Injectable()
export class BoardService {
  private logger = log4js.getLogger(BoardService.name);
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardAddress)
    private boardAddressRepository: Repository<BoardAddress>,
  ) {}

  async findAll(
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

    if (page) {
      const limit = 10; // 예를 들어 페이지당 10개의 결과
      query.skip((page - 1) * limit).take(limit);
    }

    return query.getMany();
  }

  findOne(_id: string): Promise<Board> {
    return this.boardRepository.findOne({
      where: { _id },
      relations: ['boardAddress'],
    });
  }

  async create(createBoardInput: CreateBoardInput): Promise<Board> {
    try {
      const boardAddress = createBoardInput.boardAddress
        ? await this.boardAddressRepository.save(createBoardInput.boardAddress)
        : null;
      const board = this.boardRepository.create({
        ...createBoardInput,
        boardAddress,
        _id: boardAddress._id,
      });
      this.logger.info(`-- 게시글 생성 : ${JSON.stringify(board)} --`);
      return this.boardRepository.save(board);
    } catch (error) {
      this.logger.error(`-- 게시글 생성 Error: ${error} --`);
    }
  }

  async update(
    updateBoardInput: UpdateBoardInput,
    boardId: string,
    password: string,
  ): Promise<Board> {
    try {
      const fetchBoard = await this.boardRepository.findOne({
        where: { _id: boardId, password },
        relations: ['boardAddress'],
      });

      if (!fetchBoard) {
        throw new NotFoundException('Board not found');
      }

      const { boardAddress, ...selectBoard } = fetchBoard;
      const { title, contents, youtubeUrl, images } = updateBoardInput;
      const { zipcode, address, addressDetail } = updateBoardInput.boardAddress;
      const resultBoard = await this.boardRepository.save({
        ...selectBoard,
        title,
        contents,
        youtubeUrl,
        images,
      });
      const resultBoardAddress = await this.boardAddressRepository.save({
        ...boardAddress,
        zipcode,
        address,
        addressDetail,
      });
      const board = { ...resultBoard, boardAddress: { ...resultBoardAddress } };
      this.logger.info(`-- 게시글 수정 : ${JSON.stringify(board)} --`);
      return board;
    } catch (error) {
      this.logger.error(`-- 게시글 수정 Error: ${error} --`);
    }
  }

  async delete(boardId: string): Promise<boolean> {
    const board = await this.boardAddressRepository.findOne({
      where: { _id: boardId },
    });
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    await this.boardAddressRepository.delete(boardId);
    return true;
  }
}
