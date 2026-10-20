@echo off
echo ====================================================
echo   Starting FoodSense Prototype (Backend + Frontend)
echo ====================================================

start "FoodSense Backend (FastAPI)" cmd /k "cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
start "FoodSense Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo Backend running at:  http://localhost:8000/docs
echo Frontend running at: http://localhost:5173
pause
