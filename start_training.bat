@echo off
echo ========================================
echo    Exam AI Malawi - Local Training
echo ========================================
echo.

echo 1. Preparing training data...
python prepare_training_data.py

echo.
echo 2. Starting Model Training GUI...
python model_trainer_gui.py

echo.
echo Training session completed!
pause
