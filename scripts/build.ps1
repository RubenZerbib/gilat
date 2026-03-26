$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$source = Join-Path $root "scripts\launcher.cs"
$output = Join-Path $root "ClinicForm.exe"

$code = Get-Content $source -Raw

# Add-Type uses the Roslyn / .NET compiler built into PowerShell — works
# on every Windows 10/11 machine without installing anything.
Add-Type -TypeDefinition $code `
         -Language CSharp `
         -OutputAssembly $output `
         -OutputType ConsoleApplication `
         -ReferencedAssemblies System.Net

if (Test-Path $output) {
    Write-Host "  [OK] $output" -ForegroundColor Green
    exit 0
} else {
    Write-Host "  [ERR] Compilation produced no output." -ForegroundColor Red
    exit 1
}
