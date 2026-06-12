@echo off 
title Exam AI Frontend Server - DO NOT CLOSE THIS WINDOW 
echo ======================================== 
echo    EXAM AI FRONTEND SERVER 
echo ======================================== 
echo. 
echo Starting frontend on http://localhost:3000 
echo. 
timeout /t 5 /nobreak >nul 
npm start 
echo. 
echo ======================================== 
echo Frontend stopped or crashed 
echo This window will remain open for debugging 
echo Press any key to close this window... 
pause 
