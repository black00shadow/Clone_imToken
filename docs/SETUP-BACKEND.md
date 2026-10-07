# 백엔드 API 설정 (Backend)

NestJS + Prisma + PostgreSQL API 서버입니다.

## 1. 사전 요구사항

- Node.js 20+
- npm
- Docker (PostgreSQL) — [SETUP-DATABASE.md](./SETUP-DATABASE.md) 참고

## 2. 설치

```bash
cd backend
npm install
```

## 3. 환경 변수 등록

```bash
cp .env.example .env
```

`.env` 내용:

```env
DATABASE_URL="postgresql://wallet:wallet_secret@localhost:5432/wallet?schema=public"
JWT_SECRET="your-strong-secret-here"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173,http://localhost:8081"
```

## 4. DB 마이그레이션 & 시드

```bash
npx prisma migrate dev --name init
npm run seed
```

## 5. 실행

```bash
# 개발
npm run start:dev

# 프로덕션
npm run build
npm run start:prod
```

## 6. 확인

| URL | 설명 |
|-----|------|
| http://localhost:3000/api | API root |
| http://localhost:3000/api/docs | Swagger 문서 |
| POST /api/auth/login | Admin 로그인 |

기본 Admin:

- Email: `admin@wallet.local`
- Password: `admin123456`

## 7. API 구조

### Public (앱용, 인증 불필요)

- `GET /api/public/bootstrap` — 앱 초기 데이터 (체인, 토큰, DApp, 공지 등)
- `GET /api/public/chains`
- `GET /api/public/tokens`
- `GET /api/public/risk-check?address=0x...`
- `GET /api/public/version/:platform`

### Admin (JWT 필요)

- `/api/admin/chains` — 체인 CRUD
- `/api/admin/tokens` — 토큰 CRUD
- `/api/admin/dapps` — DApp CRUD
- `/api/admin/announcements` — 공지 CRUD
- `/api/admin/banners` — 배너 CRUD
- `/api/admin/remote-config` — 원격 설정 CRUD
- `/api/admin/risk-addresses` — 리스크 주소 CRUD
- `/api/admin/app-versions` — 앱 버전 CRUD
- `/api/admin/dashboard/stats` — 대시보드 통계

## 8. 프로덕션 배포

- `JWT_SECRET` 반드시 변경
- HTTPS (Nginx / Cloudflare)
- PM2, Docker, 또는 Kubernetes
- PostgreSQL managed service 연결
