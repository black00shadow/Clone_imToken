# Infrastructure Setup

External services for RPC, push, CDN, domains, and operations.

## 1. RPC nodes (blockchain)

Used as chain RPC URLs in the app and Admin.

| Provider | URL | Cost |
|----------|-----|------|
| [Alchemy](https://www.alchemy.com/) | `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY` | Free tier |
| [Infura](https://infura.io/) | `https://mainnet.infura.io/v3/YOUR_KEY` | Free tier |
| [QuickNode](https://www.quicknode.com/) | Per chain | Paid |

After signup, set RPC URL in Admin → Chains.

## 2. Firebase (push notifications)

### Android

1. [Firebase Console](https://console.firebase.google.com/) → create project
2. Add Android app → `com.wallet.app` (same as app.json package)
3. `google-services.json` → `mobile/android/app/`
4. FCM Server Key → backend `.env`:

```env
FCM_SERVER_KEY=your-key
```

### iOS

1. Add iOS app in Firebase
2. Upload APNs key
3. `GoogleService-Info.plist` → Xcode project

## 3. Domain & SSL

| Use | Example |
|-----|---------|
| API | `api.yourwallet.com` |
| Admin | `admin.yourwallet.com` |
| CDN | `cdn.yourwallet.com` |

Cloudflare DNS + SSL recommended.

## 4. Images / CDN (banners, icons)

- [Cloudflare R2](https://www.cloudflare.com/products/r2/)
- [AWS S3](https://aws.amazon.com/s3/) + CloudFront
- [Uploadcare](https://uploadcare.com/)

Use CDN URLs for Admin banner and token icon fields.

## 5. Monitoring

| Service | Purpose |
|---------|---------|
| [Sentry](https://sentry.io/) | App/API errors |
| [Uptime Robot](https://uptimerobot.com/) | API uptime |
| Grafana + Prometheus | Server metrics |

## 6. Security (production)

- [ ] Change JWT_SECRET
- [ ] Change default admin password
- [ ] HTTPS everywhere
- [ ] Automated DB backups
- [ ] Rate limiting (API gateway)
- [ ] Wallet security audit (third party)

## 7. Environment URL examples

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
