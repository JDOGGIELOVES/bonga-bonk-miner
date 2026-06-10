@echo off
title Bonga Telegram Bot
cd /d "%~dp0"

set "NODE_DIR=C:\Users\geohi\bonga\.tools\node\node-v22.16.0-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"

echo Stopping old bot copies (if any)...
powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"name='node.exe'\" | Where-Object { $_.CommandLine -like '*telegram-bot*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"

echo.
echo  Bonga Affirmation Bot - @bonga_affirm_bot
echo  Community: https://t.me/bonga_sol_community
echo.
echo  In the GROUP, type:  /d@bonga_affirm_bot
echo.
echo  KEEP THIS WINDOW OPEN. Closing it stops the bot.
echo.

npm run dev

pause