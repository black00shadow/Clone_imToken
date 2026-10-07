# Wallet Platform

imToken-style multi-chain wallet with centralized admin management.

## Project Structure

```
wallet/
├── android/         # Kotlin native Android app (primary)
├── mobile/          # Legacy Expo app (reference)
├── admin/           # Admin panel (React + Ant Design)
├── backend/         # API server (NestJS)
├── docs/            # Setup guides (per component)
└── docker-compose.yml
```

## Quick Start

1. Start database: `docker compose up -d`
2. Backend: see [docs/SETUP-BACKEND.md](docs/SETUP-BACKEND.md)
3. Admin: see [docs/SETUP-ADMIN.md](docs/SETUP-ADMIN.md)
4. Android app: see [docs/SETUP-ANDROID.md](docs/SETUP-ANDROID.md)
5. Legacy Expo mobile: see [docs/SETUP-APP.md](docs/SETUP-APP.md)

## Setup Guides (by component)

| Component | Guide |
|-----------|-------|
| Android App (Kotlin) | [docs/SETUP-ANDROID.md](docs/SETUP-ANDROID.md) |
| Mobile App (Expo, legacy) | [docs/SETUP-APP.md](docs/SETUP-APP.md) |
| Backend API | [docs/SETUP-BACKEND.md](docs/SETUP-BACKEND.md) |
| Admin Panel | [docs/SETUP-ADMIN.md](docs/SETUP-ADMIN.md) |
| Database | [docs/SETUP-DATABASE.md](docs/SETUP-DATABASE.md) |
| Infrastructure (RPC, Push) | [docs/SETUP-INFRA.md](docs/SETUP-INFRA.md) |

## Default Admin Login

- Email: `admin@wallet.local`
- Password: `admin123456`

Change immediately in production.
