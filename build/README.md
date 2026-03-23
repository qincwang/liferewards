# Build Assets

Place your app icons here before building:

- `icon.icns` — macOS app icon (required for Mac/MAS builds)
  - Minimum size: 1024×1024 px PNG, then convert with `iconutil`
  - Or use a tool like `electron-icon-builder` to generate from a 1024×1024 PNG

## Generating icon.icns from a PNG

```bash
# With electron-icon-builder (install once):
npm install -g electron-icon-builder

# Generate all icon sizes:
electron-icon-builder --input=icon-1024.png --output=build/
```

## Code Signing (required for Mac App Store)

1. Enroll in the Apple Developer Program: https://developer.apple.com/programs/
2. Create an App ID matching `com.liferewards.app` in App Store Connect
3. Generate a "Mac App Distribution" certificate + "Mac Installer Distribution" certificate
4. Set these env vars before running `electron:build:mas`:
   - `CSC_NAME` — Your certificate name (e.g. "3rd Party Mac Developer Application: Your Name (TEAMID)")
   - `APPLE_ID` — Your Apple ID email
   - `APPLE_APP_SPECIFIC_PASSWORD` — App-specific password from appleid.apple.com
   - `APPLE_TEAM_ID` — Your 10-character team ID
