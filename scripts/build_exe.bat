@echo off
chcp 65001 >nul
title Сборка EXE файла

echo.
echo ═══════════════════════════════════════════════════════════
echo   СБОРКА DESKTOP-ПРИЛОЖЕНИЯ
echo ═══════════════════════════════════════════════════════════
echo.
echo Выберите вариант сборки:
echo.
echo 1. PKG (Node.js) - средний вес ~40-50 МБ
echo 2. PyInstaller (Python) - лёгкий ~5-10 МБ
echo 3. Просто запустить (без сборки)
echo.
set /p choice="Ваш выбор (1-3): "

if "%choice%"=="1" goto build_pkg
if "%choice%"=="2" goto build_python
if "%choice%"=="3" goto run_app
goto invalid

:build_pkg
echo.
echo ───────────────────────────────────────────────────────────
echo 📦 Сборка с помощью PKG...
echo ───────────────────────────────────────────────────────────
echo.

REM Проверка Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js не установлен!
    echo    Скачайте с https://nodejs.org/
    pause
    exit /b 1
)

REM Установка зависимостей
echo 📥 Установка зависимостей...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

REM Сборка
echo.
echo 🔨 Сборка EXE файла...
call npm run build:exe-small
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки
    pause
    exit /b 1
)

echo.
echo ✅ ГОТОВО!
echo 📁 Файл: FilmsManager.exe
echo.
goto end

:build_python
echo.
echo ───────────────────────────────────────────────────────────
echo 🐍 Сборка с помощью PyInstaller...
echo ───────────────────────────────────────────────────────────
echo.

REM Проверка Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python не установлен!
    echo    Скачайте с https://www.python.org/
    pause
    exit /b 1
)

REM Установка зависимостей
echo 📥 Установка зависимостей...
pip install pywebview pyinstaller
if %errorlevel% neq 0 (
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

REM Сборка
echo.
echo 🔨 Сборка EXE файла...
pyinstaller --onefile --windowed --name=FilmsManager app_launcher.py
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки
    pause
    exit /b 1
)

echo.
echo ✅ ГОТОВО!
echo 📁 Файл: dist\FilmsManager.exe
echo.
echo Скопируйте FilmsManager.exe из папки dist в корень проекта
echo.
goto end

:run_app
echo.
echo ───────────────────────────────────────────────────────────
echo 🚀 Запуск приложения...
echo ───────────────────────────────────────────────────────────
echo.
call start_app.bat
goto end

:invalid
echo.
echo ❌ Неверный выбор!
echo.
pause
exit /b 1

:end
echo ───────────────────────────────────────────────────────────
echo   Спасибо за использование!
echo ───────────────────────────────────────────────────────────
echo.
pause

