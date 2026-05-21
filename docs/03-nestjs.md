# 03. NestJS

> Express 위에 얹은 프레임워크. **데코레이터(@)와 의존성 주입**으로 코드를 정리하는 게 특징.

## 1. 3대장: Module / Controller / Service

```
Module (조립도)
  ├─ Controller (요청 받는 곳)
  └─ Service (로직 처리)
```

### Module

**무엇을 한 묶음으로 다룰지 정의.**

[backend/src/app.module.ts](../backend/src/app.module.ts):
```ts
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- `imports` — 가져와서 쓸 다른 모듈
- `controllers` — 이 모듈이 가진 컨트롤러
- `providers` — 이 모듈이 가진 서비스 (DI 대상)

### Controller

**URL 라우팅 담당. 요청을 받고 응답을 돌려주는 층.**

[backend/src/app.controller.ts](../backend/src/app.controller.ts):
```ts
@Controller()       // 이 클래스가 컨트롤러임을 표시
export class AppController {
  constructor(private readonly appService: AppService) {}  // 서비스 주입

  @Get()           // GET /
  getHello() { return this.appService.getHello(); }

  @Get('user-test') // GET /user-test
  @UseGuards(AccessTokenGuard)  // 인증 필수
  testUser(@Req() req: Request) {
    return `유저 이메일: ${req.user?.email}`;
  }
}
```

### Service

**진짜 비즈니스 로직.** 컨트롤러는 얇게 두고 서비스에서 일을 함.
(이 프로젝트는 데모 수준이라 서비스가 단순함)

## 2. 데코레이터 (@)

`@무엇무엇` 형태. **클래스/메서드/파라미터에 메타데이터를 붙이는 문법.** NestJS가 이 메타데이터를 보고 동작 방식을 결정함.

| 데코레이터 | 의미 |
|---|---|
| `@Module()` | 이 클래스는 모듈 |
| `@Controller('path')` | 이 클래스는 컨트롤러, base path 지정 가능 |
| `@Injectable()` | 이 클래스는 DI 가능 (Service, Strategy 등) |
| `@Get()`, `@Post()`, `@Put()`, `@Delete()` | HTTP 메서드 매핑 |
| `@Param('id')` | URL 파라미터 받기 |
| `@Body()` | 요청 body 받기 |
| `@Query()` | 쿼리스트링 받기 |
| `@Req()` | Express Request 객체 받기 |
| `@UseGuards(Guard)` | 이 라우트에 가드 적용 |

## 3. 의존성 주입 (DI)

**Nest가 알아서 객체를 만들어서 넣어준다.** 직접 `new AppService()` 안 함.

```ts
constructor(private readonly appService: AppService) {}
```

이것만 쓰면 끝. Nest가 `AppService` 인스턴스를 찾아서(또는 만들어서) 자동으로 끼워넣음.

조건은 두 가지:
1. `AppService`에 `@Injectable()` 데코레이터가 붙어있을 것
2. 어떤 모듈의 `providers` 배열에 들어있을 것

## 4. Guard

**라우트에 들어가기 전 체크하는 문지기.** 통과 못 하면 401/403.

[backend/src/auth/guards/access-token.guard.ts](../backend/src/auth/guards/access-token.guard.ts):
```ts
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt-access-token') {}
```

이걸 컨트롤러에 적용:
```ts
@Get('user-test')
@UseGuards(AccessTokenGuard)   // ← 토큰 없으면 여기서 막힘
testUser(@Req() req: Request) { ... }
```

가드 내부에선 **Passport 전략**이 토큰을 검증 (다음 섹션).

## 5. Passport JWT 전략

[backend/src/auth/strategies/access-token.strategy.ts](../backend/src/auth/strategies/access-token.strategy.ts):

```ts
@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt-access-token') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // ← 어디서 토큰 꺼낼지
      ignoreExpiration: false,
      secretOrKey: process.env.AUTH_SECRET!,                     // ← 어떤 키로 검증할지
    });
  }

  async validate(payload: JwtPayload) {
    return payload;  // ← 검증 통과 후 req.user에 들어갈 값
  }
}
```

흐름:
1. Guard가 발동 → Passport가 `'jwt-access-token'` 전략 호출
2. 전략이 `Authorization: Bearer xxx` 헤더에서 토큰 추출
3. `AUTH_SECRET`으로 서명 검증
4. 통과 시 페이로드를 `validate()`에 넘김
5. `validate()`의 리턴값이 `req.user`에 채워짐
6. 컨트롤러 안에서 `req.user.email`로 접근 가능

## 6. Express Request 타입 확장

`req.user`가 어떤 모양인지 TypeScript에게 알려주기 위해 타입 보강:

[backend/src/types/express.d.ts](../backend/src/types/express.d.ts):
```ts
declare global {
  namespace Express {
    interface User extends JwtPayload {}  // ← Express의 User 타입을 우리 JwtPayload로 덮어씀
  }
}
```

이 파일이 없으면 `req.user?.email`에서 타입 에러.

## 7. Swagger (API 문서)

[backend/src/main.ts](../backend/src/main.ts)에서 설정. 브라우저에서 `http://localhost:3001/docs`로 API 문서 확인 가능.

`@ApiBearerAuth('access-token')` 데코레이터로 "이 라우트는 토큰 필요" 표시 → Swagger UI에서 토큰 입력 후 테스트 가능.

## 다음 문서

→ [04. React Query](./04-react-query.md): 프론트에서 서버 데이터를 가져오는 표준 방식.
