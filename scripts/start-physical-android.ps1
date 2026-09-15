param(
  [string]$Serial = ''
)

$ErrorActionPreference = 'Stop'

$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
  throw 'ADB no está disponible. Abre Android Studio o agrega Android SDK platform-tools al PATH.'
}

$connected = @(
  & $adb.Source devices |
    Select-Object -Skip 1 |
    ForEach-Object {
      if ($_ -match '^(\S+)\s+device$') { $Matches[1] }
    }
)

if (-not $Serial) {
  $Serial = $connected | Where-Object { $_ -notmatch '^emulator-' } | Select-Object -First 1
}
if (-not $Serial -or $Serial -notin $connected) {
  throw 'Conecta el teléfono por USB, habilita Depuración USB y acepta la autorización RSA. También puedes indicar -Serial <id>.'
}

$apk = Join-Path $PSScriptRoot '..\android\app\build\outputs\apk\debug\app-debug.apk'
$installed = & $adb.Source -s $Serial shell pm list packages com.avanzailo.app
if (-not ($installed -match 'package:com\.avanzailo\.app')) {
  if (-not (Test-Path $apk)) {
    throw 'No existe app-debug.apk. Ejecuta npm run android:build:debug una vez.'
  }
  & $adb.Source -s $Serial install -r $apk
  if ($LASTEXITCODE -ne 0) { throw 'ADB no pudo instalar el development build.' }
}

& $adb.Source -s $Serial reverse tcp:8081 tcp:8081 | Out-Null
$env:ANDROID_SERIAL = $Serial

Write-Host "AVANZA ILO: dispositivo $Serial conectado al development build productivo."
Write-Host 'Mantén esta ventana abierta mientras pruebas la aplicación.'
npx expo start --dev-client --localhost --clear --android
