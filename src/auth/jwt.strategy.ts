import jwtSecretkey from '@/config/jwt.secretkey';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecretkey(), // .env 파일에 저장하는 것이 좋습니다
    });
  }

  async validate(payload: any) {
    return { _id: payload._id, name: payload.name };
  }
}
