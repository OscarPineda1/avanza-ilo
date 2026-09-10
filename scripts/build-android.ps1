param([switch]$SkipCompile)

$ErrorActionPreference = 'Stop'

<<<<<<< HEAD
function Get-Sha256([string]$Path) {
    $stream = [System.IO.File]::OpenRead($Path)
    $algorithm = [System.Security.Cryptography.SHA256]::Create()
    try {
        return -join ($algorithm.ComputeHash($stream) | ForEach-Object { $_.ToString('x2') })
    } finally {
        $algorithm.Dispose()
        $stream.Dispose()
    }
}

=======
>>>>>>> b824d1cf46859e282d6e8db3860cb83275da811b
$repository = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$artifacts = Join-Path $repository 'artifacts'
$androidDirectory = Join-Path $repository 'android'
$javaCandidates = @(@(
    $env:AVANZA_JAVA_HOME,
    'C:\Program Files\Android\Android Studio\jbr'
) | Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $_ 'bin\java.exe')) })

if ($javaCandidates.Count -eq 0) {
    throw 'El build Android de Expo SDK 54 requiere JDK 17 o superior. Define AVANZA_JAVA_HOME con un JDK compatible.'
}

$env:JAVA_HOME = $javaCandidates[0]
$env:Path = "${env:JAVA_HOME}\bin;$env:Path"
$javaRelease = Get-Content -LiteralPath (Join-Path $env:JAVA_HOME 'release') -Raw
if ($javaRelease -notmatch 'JAVA_VERSION="(\d+)') {
    throw 'No se pudo comprobar la versión del JDK configurado.'
}
if ([int]$Matches[1] -lt 17) {
    throw 'El build Android de Expo SDK 54 requiere JDK 17 o superior.'
}

Set-Location $repository
New-Item -ItemType Directory -Force -Path $artifacts | Out-Null
$env:CI = '1'
$env:NODE_ENV = 'production'

if (-not $SkipCompile) {
    npm ci
    npx expo-doctor
    npx expo prebuild --platform android --clean --no-install
    Push-Location $androidDirectory
    try {
        & '.\gradlew.bat' app:assembleRelease
        if ($LASTEXITCODE -ne 0) { throw 'Gradle no pudo compilar el APK release.' }
    } finally {
        Pop-Location
    }
}

$apk = Join-Path $androidDirectory 'app\build\outputs\apk\release\app-release.apk'
if (-not (Test-Path -LiteralPath $apk)) {
    throw "No se generó el APK esperado: $apk"
}

$commit = (git rev-parse HEAD).Trim()
$dataVersion = (npx tsx -e "import {ROUTE_CATALOG_METADATA as m} from './src/services/routes'; console.log(m.version)").Trim()
<<<<<<< HEAD
$hash = Get-Sha256 $apk
=======
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $apk).Hash.ToLowerInvariant()
>>>>>>> b824d1cf46859e282d6e8db3860cb83275da811b
$destination = Join-Path $artifacts "avanza-ilo-$($commit.Substring(0, 7)).apk"
Copy-Item -LiteralPath $apk -Destination $destination -Force

[ordered]@{
    commit = $commit
    dataVersion = $dataVersion
    expoSdk = '54'
    platform = 'android'
    apk = (Split-Path $destination -Leaf)
    sha256 = $hash
    generatedAt = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $artifacts 'android-build-manifest.json')

Write-Host "APK: $destination"
Write-Host "SHA256: $hash"
