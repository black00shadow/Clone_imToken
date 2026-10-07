# Placeholder assets

Expo requires icon files. Before store release, replace with your app branding:

- `icon.png` — 1024x1024
- `adaptive-icon.png` — 1024x1024 (Android)
- `splash-icon.png` — 1284x2778 recommended

For local development, run:

```bash
npx expo install expo-splash-screen
npx expo prebuild --clean
```

Or generate placeholders:

```bash
npx @expo/image-utils create-icon --help
```
