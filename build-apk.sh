#!/usr/bin/env bash
# Builds the debug APK and copies it to ~/apk-drop/ (served over Tailscale by apk-drop.service).
# The debug build is com.mathvoyager.app.preview, so it installs beside the Play Store version.
set -euo pipefail
cd "$(dirname "$0")"

dotnet publish MathVoyager.csproj -c Release -o publish
[ -f android/local.properties ] || echo "sdk.dir=${ANDROID_HOME:-$HOME/Android/Sdk}" > android/local.properties
npx cap sync android
(cd android && ./gradlew assembleDebug)
cp android/app/build/outputs/apk/debug/app-debug.apk ~/apk-drop/nous-preview-debug.apk
ls -la ~/apk-drop/nous-preview-debug.apk
