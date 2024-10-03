import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entity/board.entity';
import { CreateBoardInput } from './dto/createBoard.input';
import { FetchBoardsInput } from './dto/fetchBoards.input';
import { UpdateBoardInput } from './dto/updateBoard.input';
import { BoardAddress } from './entity/boardAddress.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,

    @InjectRepository(BoardAddress)
    private boardAddressRepository: Repository<BoardAddress>,
  ) {}

  async findAll(fetchBoardsInput: FetchBoardsInput): Promise<Board[]> {
    const { startDate, endDate, search, page } = fetchBoardsInput;
    const query = this.boardRepository.createQueryBuilder('board');

    if (startDate && endDate) {
      query.andWhere('board.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    if (search) {
      query.andWhere('board.title LIKE :search OR board.content LIKE :search', {
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
    const board = this.boardRepository.create(createBoardInput);
    return this.boardRepository.save(board);
  }

  async update(
    updateBoardInput: UpdateBoardInput,
    boardId: string,
    password: string,
  ): Promise<Board> {
    const board = await this.boardRepository.findOneBy({
      _id: boardId,
      password,
    });
    if (!board) {
      throw new Error('Board not found');
    }
    Object.assign(board, updateBoardInput);
    return this.boardRepository.save(board);
  }

  async remove(boardId: string): Promise<boolean> {
    const result = await this.boardRepository.delete(boardId);
    return result.affected > 0;
  }
}
