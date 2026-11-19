# Start B4 Studio + Storybook on all interfaces (phone on same Wi‑Fi).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$ports = @(5173, 6106)
foreach ($port in $ports) {
  $rule = "B4 Dev TCP $port"
  $existing = Get-NetFirewallRule -DisplayName $rule -ErrorAction SilentlyContinue
  if (-not $existing) {
    try {
      New-NetFirewallRule -DisplayName $rule -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port | Out-Null
      Write-Host "Firewall: allowed inbound TCP $port ($rule)"
    } catch {
      Write-Host "Firewall: could not add rule for $port (run as Admin if the phone still cannot connect)"
    }
  }
}

$pnpm = "npm"
$pnpmArgs = @("exec", "--yes", "pnpm@12.21.0")

Start-Process -FilePath $pnpm -ArgumentList ($pnpmArgs + @("run", "storybook")) -WorkingDirectory $root -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process -FilePath $pnpm -ArgumentList ($pnpmArgs + @("run", "dev:studio")) -WorkingDirectory $root -WindowStyle Normal

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.InterfaceAlias -notmatch 'Loopback' } | Select-Object -First 1).IPAddress
Write-Host ""
Write-Host "On your phone (same Wi‑Fi):"
Write-Host "  Studio:    http://${ip}:5173"
Write-Host "  Storybook: http://${ip}:6106"
Write-Host ""