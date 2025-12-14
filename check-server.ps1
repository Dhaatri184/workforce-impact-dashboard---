# Simple server check script
Write-Host "🔍 Checking if development server is accessible..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Server is running at http://localhost:5173" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not accessible at http://localhost:5173" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    Write-Host "`n🛠️ Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "1. Check if any process is using port 5173" -ForegroundColor White
    Write-Host "2. Try running: npm run dev" -ForegroundColor White
    Write-Host "3. Check if Node.js and npm are installed" -ForegroundColor White
    Write-Host "4. Open the standalone demo: CLEAN-TIME-SLIDER-DEMO.html" -ForegroundColor White
}

Write-Host "`n📄 Alternative: Open CLEAN-TIME-SLIDER-DEMO.html in your browser to see the fixed time slider" -ForegroundColor Cyan