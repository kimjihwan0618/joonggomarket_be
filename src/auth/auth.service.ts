import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@/user/entity/user.entity';
import * as log4js from 'log4js';
import { Token } from './dto/token.type';

@Injectable()
export class AuthService {
  private logger = log4js.getLogger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(password: string, email: string): Promise<any> {
    const user = await this.userService.findOneByUserEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { ...result } = user;
      this.logger.info(
        `-- 유저 로그인 validate success: email:${email}, password:${password} --`,
      );
      return result;
    }
    this.logger.error(
      `-- 유저 로그인 validate error : email:${email}, password:${password} --`,
    );
    return null;
  }

  async loginUser(user: Omit<User, 'password'>): Promise<Token> {
    const payload = {
      name: user.name,
      _id: user._id,
      email: user.email,
    };
    const result = new Token(); //
    result.accessToken = this.jwtService.sign(payload);
    return result;
  }
}
