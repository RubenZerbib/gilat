param(
    [int]$Port = 4300,
    [int]$TimeoutSeconds = 120,
    [int]$IntervalMs = 500
)

$url = "http://localhost:$Port"
$elapsed = 0
Write-Host "Waiting for server on port $Port ..." -ForegroundColor Cyan

while ($elapsed -lt ($TimeoutSeconds * 1000)) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()

        Write-Host "Server is up! Opening browser..." -ForegroundColor Green
        Start-Process $url
        exit 0
    } catch {
        # port not open yet
    }
    Start-Sleep -Milliseconds $IntervalMs
    $elapsed += $IntervalMs
}

Write-Host "Timed out after $TimeoutSeconds seconds." -ForegroundColor Red
exit 1
