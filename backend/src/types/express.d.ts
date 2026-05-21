// [개념] 글로벌 타입 보강 (declare global) - Express.User 타입에 JWT payload 모양을 합쳐서 req.user.email 같은 접근에 타입 체크가 통하게 → docs/03-nestjs.md (#6)
import { Express } from 'express';

type JwtPayload = {
  sub: string;
  email?: string;
  name?: string;
  picture?: null;
  iat?: number;
};

declare global {
  namespace Express {
    interface User extends JwtPayload {}
  }
}