@echo off
:: 1. Navigate to your project directory
cd /d "D:\Development\Projects\TrendSense---Studio"

:: 2. Activate your virtual environment
call .venv\Scripts\activate

:: 3. Run the Reddit Scraper
python backend/reddit_fetcher.py

:: 4. Run the Model Retrainer
python backend/retrain.py

:: 5. Keep the window open for 10 seconds so you can see the success message
timeout /t 10