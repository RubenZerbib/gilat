param(
    [string]$Url = "http://localhost:4300",
    [int]$TimeoutSeconds = 60,
    [int]$IntervalMs = 500
)

$elapsed = 0
Write-Host "Waiting for $Url ..." -ForegroundColor Cyan

while ($elapsed -lt ($TimeoutSeconds * 1000)) {
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "Server is up! Opening browser..." -ForegroundColor Green
            Start-Process $Url
            exit 0
        }
    } catch {
        # server not ready yet
    }
    Start-Sleep -Milliseconds $IntervalMs
    $elapsed += $IntervalMs
}

Write-Host "Timed out after $TimeoutSeconds seconds waiting for $Url" -ForegroundColor Red
exit 1
