@echo off
title Answup - Activate Auto-Build
cd /d "%~dp0"
echo.
echo  ============================================
echo   ANSWUP AUTO-BUILD ACTIVATION
echo  ============================================
echo.
echo  1. A browser is opening to your Vapi API Keys page.
echo  2. Copy the PRIVATE key.
echo  3. Come back here, paste it (right-click), press Enter.
echo.
start https://dashboard.vapi.ai/org/api-keys
call vercel env add VAPI_PRIVATE_KEY production
echo.
echo  Deploying so the key takes effect...
call vercel deploy --prod --yes
echo.
echo  DONE. Every new signup now builds its own AI receptionist.
echo.
pause
