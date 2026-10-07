# Kotlin Android App Setup

Native Android wallet app (Jetpack Compose + web3j + bitcoinj).

## Requirements

- Android Studio Ladybug (2024.2+) or newer
- JDK 17
- Android SDK 35

## Open Project

1. Android Studio → **Open** → select `android/` folder
2. Wait for Gradle sync
3. If prompted, create `local.properties` with SDK path:
   ```
   sdk.dir=C\:\\Users\\YOUR_USER\\AppData\\Local\\Android\\Sdk
   ```

## API URL

Edit `android/app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.142:3000/api\"")
```

- **Emulator**: use `http://10.0.2.2:3000/api`
- **Real device**: use your PC Wi-Fi IP

## Run on Device

1. Enable **Developer options** + **USB debugging** on phone
2. Connect USB → allow debugging
3. Android Studio → Run ▶ (select device)

## WalletConnect

1. Get a Project ID from [dashboard.reown.com](https://dashboard.reown.com)
2. `android/app/build.gradle.kts`:
   ```kotlin
   buildConfigField("String", "WC_PROJECT_ID", "\"your_project_id\"")
   ```
3. Copy a `wc:` URI from a DApp → paste on the WalletConnect screen

```bash
cd android
./gradlew assembleDebug
```

APK output:
`app/build/outputs/apk/debug/app-debug.apk`

Release APK:
```bash
./gradlew assembleRelease
```

## Features (Kotlin)

| Feature | Status |
|---------|--------|
| BIP39 create/import | ✅ |
| PIN + Encrypted storage | ✅ |
| Multi-account HD (19 non-EVM + 44 EVM) | ✅ |
| Bootstrap from backend (63 chains + family metadata) | ✅ |
| Wallet / Market / Browser / Me tabs | ✅ |
| Native address derive (SLIP-0010 Ed25519 + BIP44) | ✅ |
| Native balances (all 63 chains) | ✅ |
| DApp WebView browser | ✅ |
| Send: EVM / BTC / TRON / TON(V4R2) / Cosmos / SOL / LTC / DOGE | ✅ |
| Receive QR (per-chain correct address) | ✅ |
| TX History | ✅ |
| Tokenlon swap (0x) | ✅ |
| Risk address check | ✅ |
| WalletConnect v2 (Reown) | ✅ |
| View-only: DOT/KSM/XTZ/CKB/FIL + balance | ✅ |
| Send: APT/SUI/NEAR/XLM/XRP/BCH | 🔜 (address+balance ready) |
| NFT / Approvals / Ledger | 🔜 |

## vs Expo (`mobile/`)

The Expo app remains for reference. **Use `android/` for native builds** going forward.
