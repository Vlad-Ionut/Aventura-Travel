@echo off
REM Pornire Aventura Travel (Windows)
cd /d "%~dp0.."

echo === Branch corect ===
git fetch origin
git checkout cursor/aventura-travel-features-80dc
if errorlevel 1 (
  echo EROARE: nu pot schimba pe branch. Ruleaza: git stash
  pause
  exit /b 1
)

echo === Dependinte ===
call npm install

echo === Baza de date ===
call npm run db:init
if errorlevel 1 (
  echo.
  echo Daca a esuat DB: creeaza in pgAdmin user vlad1/vlad1 si DB aventuratravel
  echo apoi ruleaza din nou: npm run db:init
  pause
)

echo === Server pe http://localhost:8080 ===
call npm start
pause
