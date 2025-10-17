@echo off
echo ============================================================
echo   Starting Remindly - Enhanced Alzheimer's Dashboard
echo   With Dataset Integration
echo ============================================================
echo.

REM Start MongoDB (if needed)
echo [1/3] Checking MongoDB...
echo MongoDB should be running separately if using database features
echo.

REM Start Node.js Backend
echo [2/3] Starting Node.js Backend Server...
start "Node.js Backend" cmd /k "cd Backend && npm start"
timeout /t 3 /nobreak >nul
echo Backend started on http://localhost:5000
echo.

REM Start Enhanced Python Flask API with Dataset
echo [3/3] Starting Enhanced Python Flask API with Dataset...
start "Python Flask API (Enhanced)" cmd /k "cd Model && python enhanced_model_api.py"
timeout /t 3 /nobreak >nul
echo Enhanced Python API started on http://localhost:5001
echo.

REM Start React Frontend
echo [4/4] Starting React Frontend...
start "React Frontend" cmd /k "cd Frontend && npm start"
echo Frontend will open at http://localhost:3000
echo.

echo ============================================================
echo   All Services Started Successfully!
echo ============================================================
echo.
echo   Frontend:        http://localhost:3000
echo   Node.js Backend: http://localhost:5000
echo   Python API:      http://localhost:5001 (Enhanced with Dataset)
echo.
echo   Features:
echo   - AI-Powered Predictions
echo   - Dataset-Based Analysis
echo   - Similar Patient Matching
echo   - Personalized Recommendations
echo   - Statistical Insights
echo.
echo   Press any key to open the dashboard in your browser...
pause >nul
start http://localhost:3000
echo.
echo   To stop all services, close all terminal windows
echo ============================================================
