param(
  [string]$Project = (Join-Path $PSScriptRoot 'ai_powered_plc_development.apj'),
  [string]$Config = 'Main',
  [ValidateSet('Build','Rebuild','Transfer')][string]$BuildMode = 'Build',
  [switch]$Transfer = $false,
  [string]$Device = 'Type=TCP;Address=127.0.0.1;Port=11169',
  [string]$ASRoot,
  [string]$ASVersion
)
$ErrorActionPreference = 'Stop'

$helper = Join-Path (Join-Path $PSScriptRoot '50 - AI instructions') 'ai_helper/build.ps1'
if (-not (Test-Path $helper)) {
  throw "Helper script not found: $helper"
}

$psArgs = @('-File', $helper, '-Project', $Project, '-Config', $Config, '-BuildMode', $BuildMode)
if ($Transfer) { $psArgs += '-Transfer' }
if ($Device)   { $psArgs += @('-Device', $Device) }
if ($ASRoot)   { $psArgs += @('-ASRoot', $ASRoot) }
if ($ASVersion){ $psArgs += @('-ASVersion', $ASVersion) }

pwsh -NoProfile -ExecutionPolicy Bypass @psArgs
if ($LASTEXITCODE -ne 0 -and $LASTEXITCODE -ne 1) { exit $LASTEXITCODE }
