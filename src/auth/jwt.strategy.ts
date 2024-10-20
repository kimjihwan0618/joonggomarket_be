import jwtSecretkey from '@/config/jwt.secretkey';
import { User } from '@/user/entity/user.entity';
import { UserService } from '@/user/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecretkey(), // .env 파일에 저장하는 것이 좋습니다
    });
  }

  async validate(payload: any): Promise<User> {
    const user = await this.userService.findById(payload._id); // payload._id를 사용하여 유저 조회
    console.log('유저 객체 확인2---------------------------');
    console.log(JSON.stringify(user, null, 2));
    if (!user) {
      throw new UnauthorizedException(); // 유저가 존재하지 않는 경우 에러 처리
    }
    return user; // 유저 정보 반환
  }
}
