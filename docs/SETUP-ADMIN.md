# Admin Panel 설정 (Frontend)

React + Vite + Ant Design 관리자 패널입니다.

## 1. 사전 요구사항

- Node.js 20+
- 백엔드 API 실행 중 — [SETUP-BACKEND.md](./SETUP-BACKEND.md)

## 2. 설치

```bash
cd admin
npm install
```

## 3. 환경 변수 등록

```bash
cp .env.example .env
```

`.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

프로덕션:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 4. 실행

```bash
npm run dev
```

브라우저: http://localhost:5173

## 5. 로그인

| 항목 | 값 |
|------|-----|
| Email | admin@wallet.local |
| Password | admin123456 |

## 6. 관리 메뉴

| 메뉴 | 기능 |
|------|------|
| 대시보드 | 등록된 리소스 통계 |
| 체인 관리 | 블록체인 네트워크, RPC URL |
| 토큰 관리 | 체인별 토큰 목록 |
| DApp 관리 | DApp 카탈로그 |
| 공지사항 | 앱 내 공지 |
| 배너 | 홈 배너 |
| 원격 설정 | 기능 on/off (swap_enabled 등) |
| 리스크 주소 | 피싱/악성 주소 DB |
| 앱 버전 | 강제 업데이트, 버전 관리 |

## 7. 빌드 & 배포

```bash
npm run build
```

`dist/` 폴더를 Nginx, Vercel, Netlify 등에 배포.

Nginx 예시:

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

## 8. Admin 계정 추가

현재는 시드 Admin 1개. 추가 계정은 DB에 직접 insert하거나, 추후 Admin CRUD API 확장.

```sql
-- bcrypt hash of 'yourpassword' 필요
INSERT INTO "Admin" (id, email, password, name, role)
VALUES ('...', 'editor@wallet.local', '$2b$10$...', 'Editor', 'EDITOR');
```
