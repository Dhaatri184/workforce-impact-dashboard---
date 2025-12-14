# Workforce Impact Dashboard - All Services Startup Script

Write-Host "🚀 Starting Workforce Impact Dashboard Services..." -ForegroundColor Green

# Check if Docker is running
Write-Host "📋 Checking Docker status..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Clean up any existing containers
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker stop workforce-dashboard-main 2>$null
docker rm workforce-dashboard-main 2>$null

# Build the development image
Write-Host "🔨 Building development image..." -ForegroundColor Yellow
docker build -f Dockerfile.dev -t workforce-dashboard-dev .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Development image built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to build development image" -ForegroundColor Red
    exit 1
}

# Start main development server
Write-Host "🌐 Starting main development server on port 5173..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "docker" -ArgumentList "run", "-p", "5173:5173", "--name", "workforce-dashboard-main", "workforce-dashboard-dev"

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check if server is running
$serverRunning = $false
for ($i = 1; $i -le 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverRunning = $true
            break
        }
    } catch {
        # Server not ready yet
    }
    Write-Host "⏳ Attempt $i/10 - Waiting for server..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
}

if ($serverRunning) {
    Write-Host "✅ Development server is running at http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "⚠️  Development server may still be starting. Check http://localhost:5173" -ForegroundColor Yellow
}

# Display service status
Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
Write-Host "🌐 Main Dashboard: http://localhost:5173" -ForegroundColor White
Write-Host "📄 Demo Version: Open demo.html in browser" -ForegroundColor White

# Display available npm scripts
Write-Host "`n🛠️  Available Commands:" -ForegroundColor Cyan
Write-Host "npm run test          - Run test suite" -ForegroundColor White
Write-Host "npm run test:coverage - Run tests with coverage" -ForegroundColor White
Write-Host "npm run lint          - Run ESLint" -ForegroundColor White
Write-Host "npm run type-check    - Run TypeScript check" -ForegroundColor White
Write-Host "npm run build         - Build for production" -ForegroundColor White

Write-Host "`n🎉 All services started successfully!" -ForegroundColor Green
Write-Host "📱 Open http://localhost:5173 in your browser to access the dashboard" -ForegroundColor Cyan