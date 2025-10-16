@echo off
echo ========================================
echo Starting Alzheimer Care Dashboard
echo with AI Prediction Integration
echo ========================================
echo.

echo [1/3] Starting Python Flask API (Port 5001)...
start "Python Flask API" cmd /k "cd Model && python test_model_api.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Node.js Backend (Port 5000)...
start "Node.js Backend" cmd /k "cd Backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Starting React Frontend (Port 3000)...
start "React Frontend" cmd /k "cd Frontend && npm start"

echo.
echo ========================================
echo All servers are starting!
echo ========================================
echo.
echo Python Flask API:  http://localhost:5001
echo Node.js Backend:   http://localhost:5000
echo React Frontend:    http://localhost:3000
echo.
echo Press any key to close this window...
echo (The servers will continue running in separate windows)
pause >nul
