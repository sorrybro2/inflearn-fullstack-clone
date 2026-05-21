// [개념] Auth 전용 모듈 - PassportModule + JwtModule을 imports, AccessTokenStrategy를 providers로 등록 → docs/03-nestjs.md (#1, #5)
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from './strategies/access-token.strategy';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  providers: [AccessTokenStrategy],
})
export class AuthModule {}
