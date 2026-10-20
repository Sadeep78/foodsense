# PowerShell start script for FoodSense
Write-Host "====================================================" -ForegroundColor Green
Write-Host "  Starting FoodSense Prototype (Backend + Frontend)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Backend running at:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "Frontend running at: http://localhost:5173" -ForegroundColor Cyan
