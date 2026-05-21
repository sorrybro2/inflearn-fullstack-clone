// [개념] Passport JWT 전략 - Authorization: Bearer 헤더에서 토큰 추출, AUTH_SECRET으로 검증, validate() 리턴값이 req.user에 채워짐 → docs/03-nestjs.md (#5), docs/06-auth-flow.md (#6)
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  picture?: null;
  iat?: number;
};

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_SECRET!,
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
