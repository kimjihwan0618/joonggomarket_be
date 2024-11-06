import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: 'markets_jwt_secret_key',
      signOptions: { expiresIn: '7d' }, // 토큰 유효기간 설정
    }),
  ],
  providers: [AuthService, JwtStrategy, AuthResolver],
})
export class AuthModule {}
