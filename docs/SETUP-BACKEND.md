# Backend API Setup

NestJS + Prisma + PostgreSQL API server.

## 1. Prerequisites

- Node.js 20+
- npm
- Docker (PostgreSQL) — see [SETUP-DATABASE.md](./SETUP-DATABASE.md)

## 2. Install

```bash
cd backend
npm install
```

## 3. Environment variables

```bash
cp .env.example .env
```

Example `.env`:

```env
DATABASE_URL="postgresql://wallet:wallet_secret@localhost:5432/wallet?schema=public"
JWT_SECRET="your-strong-secret-here"
JWT_EXPIRES_IN="7d"
PORT=3000
CORS_ORIGIN="http://localhost:5173,http://localhost:8081"
```

## 4. DB migration & seed

```bash
npx prisma migrate dev --name init
npm run seed
```

## 5. Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 6. Verify

| URL | Description |
|-----|-------------|
| http://localhost:3000/api | API root |
| http://localhost:3000/api/docs | Swagger docs |
| POST /api/auth/login | Admin login |

Default admin:

- Email: `admin@wallet.local`
- Password: `admin123456`

## 7. API structure

### Public (app, no auth)

- `GET /api/public/bootstrap` — initial app data (chains, tokens, DApps, announcements, etc.)
- `GET /api/public/chains`
- `GET /api/public/tokens`
- `GET /api/public/risk-check?address=0x...`
- `GET /api/public/version/:platform`

### Admin (JWT required)

- `/api/admin/chains` — chain CRUD
- `/api/admin/tokens` — token CRUD
- `/api/admin/dapps` — DApp CRUD
- `/api/admin/announcements` — announcement CRUD
- `/api/admin/banners` — banner CRUD
- `/api/admin/remote-config` — remote config CRUD
- `/api/admin/risk-addresses` — risk address CRUD
- `/api/admin/app-versions` — app version CRUD
- `/api/admin/dashboard/stats` — dashboard stats

## 8. Production deployment

- Change `JWT_SECRET`
- HTTPS (Nginx / Cloudflare)
- PM2, Docker, or Kubernetes
- Connect to a managed PostgreSQL service
