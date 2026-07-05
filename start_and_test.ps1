$ErrorActionPreference = "Continue"

# Kill any stale processes on ports
Write-Host "--- Cleaning up old processes on ports 8000 and 5173 ---"
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# Start Backend
Write-Host "--- Starting FastAPI Backend on port 8000 ---"
$backendProc = Start-Process -FilePath "python" -ArgumentList "-m","uvicorn","app.main:app","--reload","--port","8000" -WorkingDirectory "D:\AI Agent\backend" -PassThru -WindowStyle Hidden
Write-Host "Backend PID: $($backendProc.Id)"

# Start Frontend
Write-Host "--- Starting React Frontend on port 5173 ---"
$frontendProc = Start-Process -FilePath "cmd" -ArgumentList "/c","npm run dev" -WorkingDirectory "D:\AI Agent\frontend" -PassThru -WindowStyle Hidden
Write-Host "Frontend PID: $($frontendProc.Id)"

# Wait for backend to be ready
Write-Host "--- Waiting 12 seconds for servers to initialize ---"
Start-Sleep -Seconds 12

# Verify backend is up
Write-Host "--- Verifying backend health ---"
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8000/api/health" -TimeoutSec 10
    Write-Host "Backend Status: $($health.status) | Service: $($health.service)"
} catch {
    Write-Host "ERROR: Backend not reachable - $($_.Exception.Message)"
    exit 1
}

# Run E2E tests
Write-Host "--- Running Full E2E Test Suite ---"
$env:PYTHONIOENCODING = "utf-8"
cd "D:\AI Agent\backend"
& python -X utf8 run_e2e_tests.py

Write-Host ""
Write-Host "--- Servers remain running ---"
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:8000"
Write-Host "API Docs: http://localhost:8000/docs"
