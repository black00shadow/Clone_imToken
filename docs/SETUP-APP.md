# 모바일 앱 설정 (App)

React Native (Expo) 지갑 앱입니다.

## 1. 사전 요구사항

- Node.js 20+
- [Expo Go](https://expo.dev/go) (실기기 테스트) 또는 Android Studio / Xcode
- 백엔드 API 실행 중

## 2. 설치

```bash
cd mobile
npm install
```

## 3. 환경 변수 등록

```bash
cp .env.example .env
```

`.env`:

```env
# Android Emulator → 10.0.2.2 = host localhost
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# iOS Simulator / 실기기 (같은 Wi-Fi)
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api

# 로컬 웹
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 4. 앱 아이콘 등록

`mobile/assets/` 폴더에 다음 파일 추가:

| 파일 | 크기 |
|------|------|
| icon.png | 1024×1024 |
| adaptive-icon.png | 1024×1024 |
| splash-icon.png | 1284×2778 |

`app.json`에서 앱 이름·패키지명 변경:

```json
{
  "expo": {
    "name": "YourWallet",
    "android": { "package": "com.yourcompany.wallet" },
    "ios": { "bundleIdentifier": "com.yourcompany.wallet" }
  }
}
```

## 5. 실행

```bash
npm start
```

- `a` — Android Emulator
- `i` — iOS Simulator
- QR 코드 — Expo Go 앱으로 스캔

## 6. 앱 기능

| 기능 | 설명 |
|------|------|
| 지갑 생성 | 12-word mnemonic (BIP39) |
| 지갑 가져오기 | Mnemonic import |
| PIN | Secure Store 저장 |
| 자산 | Admin에서 등록한 체인/토큰 표시 |
| 전송/수신 | EVM native token |
| DApp | Admin 등록 DApp 목록 |
| 리스크 체크 | Admin 리스크 주소 DB 연동 |
| Bootstrap | Admin 설정 원격 로드 |

## 7. Google Play 등록

1. `eas.json` 생성 (Expo Application Services)
2. `eas build --platform android`
3. Play Console → 새 앱 → AAB 업로드
4. [SETUP-INFRA.md](./SETUP-INFRA.md) 푸시/RPC 설정

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production
```

## 8. Apple App Store 등록

1. Apple Developer Program ($99/년)
2. `eas build -p ios --profile production`
3. App Store Connect 업로드

## 9. 실기기 API 연결 팁

- PC와 폰이 **같은 Wi-Fi**
- Windows 방화벽에서 3000 포트 허용
- `ipconfig`로 PC IP 확인 → `.env`에 설정
