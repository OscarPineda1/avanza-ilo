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
Set-Location $repository
New-Item -ItemType Directory -Force -Path $artifacts | Out-Null

$commit = (git rev-parse HEAD).Trim()
$archive = Join-Path $artifacts "avanza-ilo-source-$($commit.Substring(0, 7)).zip"
git archive --format=zip --output=$archive HEAD

<<<<<<< HEAD
$hash = Get-Sha256 $archive
=======
$hash = (Get-FileHash -Algorithm SHA256 -LiteralPath $archive).Hash.ToLowerInvariant()
>>>>>>> b824d1cf46859e282d6e8db3860cb83275da811b
[ordered]@{
    commit = $commit
    archive = (Split-Path $archive -Leaf)
    sha256 = $hash
    excludesSecrets = $true
    restoreCommand = 'Expand-Archive <archivo.zip> <destino>; cd <destino>; npm ci; npm run verify'
} | ConvertTo-Json | Set-Content -Encoding utf8 (Join-Path $artifacts 'source-backup-manifest.json')

Write-Host "Respaldo: $archive"
Write-Host "SHA256: $hash"
