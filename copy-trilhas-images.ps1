# =====================================================
# Script: copy-trilhas-images.ps1
# Purpose: Copy the generated Aprendizado trilha images
#          from the Grok session folder into assets/trilhas/
#          with correct names (1.jpg -> t1.jpg, etc.)
# =====================================================

$ErrorActionPreference = "Stop"

$sessionImages = "C:\Users\lecto\.grok\sessions\019f3e11-6524-7fa2-9a18-c3f85b2c8dde\images"
$targetFolder = "assets\trilhas"

Write-Host "=== Copiando imagens das Trilhas de Aprendizado ===" -ForegroundColor Cyan
Write-Host "Origem : $sessionImages"
Write-Host "Destino: $targetFolder"
Write-Host ""

if (-not (Test-Path $sessionImages)) {
    Write-Host "ERRO: Pasta de origem não encontrada!" -ForegroundColor Red
    Write-Host "Verifique se o caminho da sessão está correto." -ForegroundColor Yellow
    exit 1
}

# Ensure target exists
New-Item -ItemType Directory -Force -Path $targetFolder | Out-Null

$copies = @(
    @{ src = "1.jpg";  dst = "t1.jpg" },
    @{ src = "2.jpg";  dst = "t2.jpg" },
    @{ src = "3.jpg";  dst = "t3.jpg" },
    @{ src = "4.jpg";  dst = "t4.jpg" },
    @{ src = "5.jpg";  dst = "t5.jpg" },
    @{ src = "6.jpg";  dst = "t6.jpg" },
    @{ src = "7.jpg";  dst = "t7.jpg" },
    @{ src = "8.jpg";  dst = "t8.jpg" },
    @{ src = "9.jpg";  dst = "t9.jpg" },
    @{ src = "10.jpg"; dst = "t10.jpg" },
    @{ src = "11.jpg"; dst = "t11.jpg" },
    @{ src = "12.jpg"; dst = "t12.jpg" },
    @{ src = "13.jpg"; dst = "t13.jpg" },
    @{ src = "14.jpg"; dst = "t14.jpg" },
    @{ src = "15.jpg"; dst = "t15.jpg" },
    @{ src = "16.jpg"; dst = "t16.jpg" },
    @{ src = "17.jpg"; dst = "t17.jpg" },
    @{ src = "18.jpg"; dst = "t18.jpg" },
    @{ src = "19.jpg"; dst = "t19.jpg" },
    @{ src = "20.jpg"; dst = "t20.jpg" },
    @{ src = "21.jpg"; dst = "t21.jpg" },
    @{ src = "22.jpg"; dst = "t22.jpg" },
    @{ src = "23.jpg"; dst = "t23.jpg" },
    @{ src = "24.jpg"; dst = "t24.jpg" }
)

$success = 0
$missing = 0

foreach ($item in $copies) {
    $src = Join-Path $sessionImages $item.src
    $dst = Join-Path $targetFolder $item.dst

    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "✓ Copiado: $($item.src) → $($item.dst)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "✗ FALTANDO: $($item.src)" -ForegroundColor Red
        $missing++
    }
}

Write-Host ""
Write-Host "=== Resultado ===" -ForegroundColor Cyan
Write-Host "Copiados com sucesso: $success"
Write-Host "Faltando: $missing"

if ($missing -eq 0) {
    Write-Host "Todas as imagens foram copiadas com sucesso!" -ForegroundColor Green
    Write-Host "Agora rode o servidor e faça hard refresh (Ctrl+Shift+R) na aba Aprendizado." -ForegroundColor Yellow
} else {
    Write-Host "Algumas imagens não foram encontradas. Verifique a pasta da sessão." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Arquivos atuais em assets\trilhas:"
Get-ChildItem $targetFolder | Select-Object Name, Length | Format-Table -AutoSize
