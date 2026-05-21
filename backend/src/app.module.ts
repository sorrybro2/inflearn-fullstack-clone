// [개념] @Module 데코레이터 - imports/controllers/providers 3종으로 모듈 조립. ConfigModule.forRoot의 isGlobal로 어디서나 env 사용 → docs/03-nestjs.md (#1)
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
