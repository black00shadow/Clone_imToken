# 인프라 설정 (Infrastructure)

RPC, 푸시, CDN, 도메인 등 운영에 필요한 외부 서비스 등록 가이드입니다.

## 1. RPC 노드 (블록체인)

앱과 Admin에서 체인 RPC URL로 사용합니다.

| 제공자 | URL | 비용 |
|--------|-----|------|
| [Alchemy](https://www.alchemy.com/) | `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY` | Free tier |
| [Infura](https://infura.io/) | `https://mainnet.infura.io/v3/YOUR_KEY` | Free tier |
| [QuickNode](https://www.quicknode.com/) | 체인별 | 유료 |

등록 후 Admin → 체인 관리 → RPC URL에 입력.

## 2. Firebase (푸시 알림)

### Android

1. [Firebase Console](https://console.firebase.google.com/) → 프로젝트 생성
2. Android 앱 추가 → `com.wallet.app` (app.json package와 동일)
3. `google-services.json` → `mobile/android/app/`
4. FCM Server Key → 백엔드 `.env`:

```env
FCM_SERVER_KEY=your-key
```

### iOS

1. Firebase에 iOS 앱 추가
2. APNs Key 업로드
3. `GoogleService-Info.plist` → Xcode 프로젝트

## 3. 도메인 & SSL

| 용도 | 예시 |
|------|------|
| API | `api.yourwallet.com` |
| Admin | `admin.yourwallet.com` |
| CDN | `cdn.yourwallet.com` |

Cloudflare DNS + SSL 권장.

## 4. 이미지/CDN (배너, 아이콘)

- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [AWS S3](https://aws.amazon.com/s3/) + CloudFront
- [Uploadcare](https://uploadcare.com/)

Admin 배너/토큰 아이콘 URL에 CDN URL 사용.

## 5. 모니터링

| 서비스 | 용도 |
|--------|------|
| [Sentry](https://sentry.io/) | 앱/API 에러 |
| [Uptime Robot](https://uptimerobot.com/) | API 가동률 |
| Grafana + Prometheus | 서버 메트릭 |

## 6. 보안 (프로덕션 필수)

- [ ] JWT_SECRET 변경
- [ ] Admin 기본 비밀번호 변경
- [ ] HTTPS everywhere
- [ ] DB 백업 자동화
- [ ] Rate limiting (API Gateway)
- [ ] 지갑 보안 감사 (외부 업체)

## 7. 환경별 URL 예시

```env
# Production backend .env
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://admin.yourwallet.com
JWT_SECRET=64-char-random-string

# Production admin .env
VITE_API_URL=https://api.yourwallet.com/api

# Production mobile .env
EXPO_PUBLIC_API_URL=https://api.yourwallet.com/api
```
