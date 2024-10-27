import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@/user/entity/user.entity';
import * as log4js from 'log4js';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class AuthService {
  private logger = log4js.getLogger(AuthService.name);
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(password: string, email: string): Promise<User> {
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

  async loginUser(
    password: string,
    email: string,
  ): Promise<{ accessToken: string; myRefreshToken: string }> {
    const user = await this.validateUser(password, email);
    if (!user) {
      throw new Error('유저 정보가 잘못입력되었습니다.');
    }
    const payload = {
      name: user.name,
      _id: user._id,
      email: user.email,
    };
    const result = { accessToken: '', myRefreshToken: '' };
    result.accessToken = this.jwtService.sign({ ...payload, expiresIn: '1h' });
    result.myRefreshToken = this.jwtService.sign({
      ...payload,
      expiresIn: '7d',
    });
    return result;
  }

  async restoreAccessToken(
    myRefreshToken: string,
  ): Promise<{ accessToken: string; myRefreshToken: string }> {
    try {
      const user = this.jwtService.verify(myRefreshToken);
      const payload = {
        name: user.name,
        _id: user._id,
        email: user.email,
      };

      // 새로운 Access Token과 Refresh Token 생성
      const result = {
        accessToken: this.jwtService.sign({ ...payload, expiresIn: '1h' }),
        myRefreshToken: this.jwtService.sign({ ...payload, expiresIn: '7d' }),
      };

      return result;
    } catch (error) {
      this.logger.error(
        `-- refreshToken이 유효하지 않습니다. : refreshToken : ${myRefreshToken} --`,
      );
    }
  }

  async logoutUser(accessToken: string): Promise<boolean> {
    try {
      // Redis에 토큰을 블랙리스트로 추가
      const payload = this.jwtService.decode(accessToken) as any;
      const ttl = payload.exp - Math.floor(Date.now() / 1000); // 만료 시간까지 남은 시간 계산
      await this.redisService
        .getOrThrow()
        .set(`${accessToken}`, 'true', 'EX', ttl);
      return true;
    } catch (error) {}
    if (!accessToken) {
      this.logger.error(
        `-- accessToken이 유효하지 않습니다. : accessToken : ${accessToken} --`,
      );
      return false;
    }
  }
}
