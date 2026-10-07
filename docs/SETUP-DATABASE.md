# 데이터베이스 설정 (Database)

PostgreSQL + Redis를 Docker로 실행합니다.

## 1. 사전 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) 설치

## 2. DB 실행

프로젝트 루트에서:

```bash
docker compose up -d
```

## 3. 연결 정보

| 항목 | 값 |
|------|-----|
| PostgreSQL Host | `localhost` |
| Port | `5432` |
| Database | `wallet` |
| User | `wallet` |
| Password | `wallet_secret` |
| Redis | `localhost:6379` |

## 4. DATABASE_URL

백엔드 `.env` 파일에 사용:

```
DATABASE_URL="postgresql://wallet:wallet_secret@localhost:5432/wallet?schema=public"
```

## 5. 중지 / 삭제

```bash
# 중지
docker compose down

# 데이터까지 삭제
docker compose down -v
```

## 6. 프로덕션

- AWS RDS, GCP Cloud SQL, Supabase 등 managed PostgreSQL 사용 권장
- Redis: ElastiCache, Upstash 등
- SSL 연결 필수
- 백업 자동화 설정
