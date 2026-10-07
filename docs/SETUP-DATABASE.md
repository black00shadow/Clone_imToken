# Database Setup

Run PostgreSQL + Redis with Docker.

## 1. Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 2. Start databases

From the project root:

```bash
docker compose up -d
```

## 3. Connection info

| Field | Value |
|-------|-------|
| PostgreSQL host | `localhost` |
| Port | `5432` |
| Database | `wallet` |
| User | `wallet` |
| Password | `wallet_secret` |
| Redis | `localhost:6379` |

## 4. DATABASE_URL

Use in backend `.env`:

```
DATABASE_URL="postgresql://wallet:wallet_secret@localhost:5432/wallet?schema=public"
```

## 5. Stop / remove

```bash
# Stop
docker compose down

# Stop and delete data
docker compose down -v
```

## 6. Production

- Prefer managed PostgreSQL (AWS RDS, GCP Cloud SQL, Supabase, etc.)
- Redis: ElastiCache, Upstash, etc.
- Require SSL connections
- Configure automated backups
