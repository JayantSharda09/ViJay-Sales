@echo off
echo Starting FastAPI Backend Server...
echo.
echo Make sure you have installed the required packages:
echo   pip install fastapi uvicorn psycopg2-binary
echo.
echo Starting server on http://localhost:3000
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 3000 --reload
pause



