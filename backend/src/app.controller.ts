// [개념] @Controller/@Get + @UseGuards - 라우트 매핑 + JWT 가드. req.user는 Passport validate()의 리턴값 → docs/03-nestjs.md (#2, #4, #5)
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AccessTokenGuard } from './auth/guards/access-token.guard';
import type { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('user-test')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth('access-token')
  testUser(@Req() req: Request) {
    return `유저 이메일: ${req.user?.email}`;
  }
}
