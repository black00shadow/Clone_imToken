# Mobile App Setup (Expo)

React Native (Expo) wallet app.

## 1. Prerequisites

- Node.js 20+
- [Expo Go](https://expo.dev/go) (device testing) or Android Studio / Xcode
- Backend API running

## 2. Install

```bash
cd mobile
npm install
```

## 3. Environment variables

```bash
cp .env.example .env
```

`.env`:

```env
# Android Emulator → 10.0.2.2 = host localhost
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# iOS Simulator / physical device (same Wi-Fi)
# EXPO_PUBLIC_API_URL=http://192.168.x.x:3000/api

# Local web
# EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## 4. App icons

Add these under `mobile/assets/`:

| File | Size |
|------|------|
| icon.png | 1024×1024 |
| adaptive-icon.png | 1024×1024 |
| splash-icon.png | 1284×2778 |

Update app name and package in `app.json`:

```json
{
  "expo": {
    "name": "YourWallet",
    "android": { "package": "com.yourcompany.wallet" },
    "ios": { "bundleIdentifier": "com.yourcompany.wallet" }
  }
}
```

## 5. Run

```bash
npm start
```

- `a` — Android emulator
- `i` — iOS Simulator
- QR code — scan with Expo Go

## 6. Features

| Feature | Description |
|---------|-------------|
| Create wallet | 12-word mnemonic (BIP39) |
| Import wallet | Mnemonic import |
| PIN | Stored in Secure Store |
| Assets | Chains/tokens from Admin |
| Send / receive | EVM native token |
| DApps | DApps registered in Admin |
| Risk check | Admin risk address DB |
| Bootstrap | Remote config from Admin |

## 7. Google Play

1. Create `eas.json` (Expo Application Services)
2. `eas build --platform android`
3. Play Console → new app → upload AAB
4. Push/RPC setup — [SETUP-INFRA.md](./SETUP-INFRA.md)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production
```

## 8. Apple App Store

1. Apple Developer Program ($99/year)
2. `eas build -p ios --profile production`
3. Upload via App Store Connect

## 9. Physical device API tips

- PC and phone on the **same Wi-Fi**
- Allow port 3000 through Windows Firewall
- Run `ipconfig` for PC IP → set in `.env`
