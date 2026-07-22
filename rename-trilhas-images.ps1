# =====================================================
# Script: rename-trilhas-images.ps1
# Purpose: Rename numbered images in assets/trilhas/
#          from 1.jpg, 2.jpg ... to t1.jpg, t2.jpg ...
# =====================================================

$target = "assets\trilhas"

Write-Host "=== Renomeando imagens ===" -ForegroundColor Cyan

for ($i = 1; $i -le 24; $i++) {
    $old = Join-Path $target "$i.jpg"
    $new = Join-Path $target "t$i.jpg"
    if (Test-Path $old) {
        Rename-Item $old $new -Force
        Write-Host "Renomeado: $i.jpg -> t$i.jpg" -ForegroundColor Green
    } else {
        Write-Host "Não encontrado: $i.jpg" -ForegroundColor Yellow
    }
}

# Remove extras if any (25.jpg, 26.jpg...)
Get-ChildItem $target -Filter "*.jpg" | Where-Object { $_.Name -match '^\d+\.jpg$' -and ([int]$_.BaseName) -gt 24 } | Remove-Item -Force

Write-Host ""
Write-Host "Concluído! Arquivos atuais:"
Get-ChildItem $target -Filter "t*.jpg" | Select-Object Name | Sort-Object Name
