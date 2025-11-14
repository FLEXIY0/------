@echo off
chcp 65001 >nul
title Открыть в браузере
color 0B

echo ========================================
echo   Открытие приложения в браузере
echo ========================================
echo.

:: Проверка, запущен ли сервер
powershell -Command "(Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue).TcpTestSucceeded" | findstr "True" >nul

if %ERRORLEVEL% EQU 0 (
    echo ✅ Сервер запущен на порту 3000
    echo 🌐 Открываю браузер...
    echo.
    start http://localhost:3000/index1.html
    timeout /t 2 >nul
    exit /b 0
) else (
    color 0E
    echo ⚠ Сервер не запущен!
    echo.
    choice /C YN /M "Запустить сервер сейчас"
    if errorlevel 2 exit /b 0
    if errorlevel 1 (
        echo.
        echo Запуск сервера...
        start "" "start-server.bat"
        echo.
        echo ⏳ Ожидание запуска сервера (10 секунд)...
        timeout /t 10 >nul
        echo 🌐 Открываю браузер...
        start http://localhost:3000/index1.html
        timeout /t 2 >nul
    )
)

