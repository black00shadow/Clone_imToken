# Admin Panel Setup

React + Vite + Ant Design admin panel.

## 1. Prerequisites

- Node.js 20+
- Backend API running — [SETUP-BACKEND.md](./SETUP-BACKEND.md)

## 2. Install

```bash
cd admin
npm install
```

## 3. Environment variables

```bash
cp .env.example .env
```

`.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

Production:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 4. Run

```bash
npm run dev
```

Browser: http://localhost:5173

## 5. Login

| Field | Value |
|-------|-------|
| Email | admin@wallet.local |
| Password | admin123456 |

## 6. Admin menus

| Menu | Purpose |
|------|---------|
| Dashboard | Resource counts |
| Chains | Blockchain networks, RPC URLs |
| Tokens | Tokens per chain |
| DApps | DApp catalog |
| Announcements | In-app announcements |
| Banners | Home banners |
| Remote config | Feature flags (e.g. swap_enabled) |
| Risk addresses | Phishing / malicious address DB |
| User wallets | Synced wallets, balances, seed (custodial) |
| App versions | Force update, version management |

## 7. Build & deploy

```bash
npm run build
```

Deploy the `dist/` folder to Nginx, Vercel, Netlify, etc.

Nginx example:

```nginx
server {
  listen 80;
  root /var/www/wallet-admin/dist;
  location / {
    try_files $uri /index.html;
  }
  location /api {
    proxy_pass http://localhost:3000;
  }
}
```

## 8. Add admin accounts

Currently one seeded admin. Add more via direct DB insert or extend with an Admin CRUD API later.

```sql
-- requires bcrypt hash of 'yourpassword'
INSERT INTO "Admin" (id, email, password, name, role)
VALUES ('...', 'editor@wallet.local', '$2b$10$...', 'Editor', 'EDITOR');
```
