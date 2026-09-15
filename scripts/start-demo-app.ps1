$ErrorActionPreference = 'Stop'

$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
  throw 'ADB no está disponible. Inicia Android Studio o agrega platform-tools al PATH.'
}

$devices = & $adb.Source devices
if (-not ($devices -match "\tdevice$")) {
  throw 'No hay un emulador o dispositivo Android conectado.'
}

& $adb.Source reverse tcp:8080 tcp:8080 | Out-Null
& $adb.Source reverse tcp:5001 tcp:5001 | Out-Null

$env:EXPO_PUBLIC_FIREBASE_USE_EMULATORS = 'true'
$env:EXPO_PUBLIC_FIREBASE_EMULATOR_HOST = '127.0.0.1'
$env:EXPO_PUBLIC_FIREBASE_PROJECT_ID = 'demo-avanza-ilo'
$env:EXPO_PUBLIC_FIREBASE_API_KEY = 'demo-local-only'
$env:EXPO_PUBLIC_FIREBASE_APP_ID = '1:000000000000:android:demo-local-only'
$env:EXPO_PUBLIC_ETA_ENDPOINT = ''

Write-Host 'AVANZA ILO: iniciando development build contra Firebase Emulator Suite.'
Write-Host 'Mantén en otra terminal: npm run demo:emulators'
npx expo start --dev-client -c --android
