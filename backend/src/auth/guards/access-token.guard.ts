// [개념] NestJS Guard - @UseGuards()로 라우트에 적용. AuthGuard('jwt-access-token')는 같은 이름의 PassportStrategy를 자동으로 호출 → docs/03-nestjs.md (#4)
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access-token') {}