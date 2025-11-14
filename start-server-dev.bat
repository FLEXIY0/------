@echo off
chcp 65001 >nul
title Запуск сервера (DEV режим) - Фильмы и Сериалы
color 0B

echo ========================================
echo   Режим разработки (с автоперезагрузкой)
echo ========================================
echo.

:: Проверка Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ Node.js не установлен!
    echo Установите с https://nodejs.org/
    pause
    exit /b 1
)

:: Проверка зависимостей
if not exist "node_modules\" (
    echo 📦 Установка зависимостей...
    call npm install
    echo.
)

:: Проверка nodemon
where nodemon >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠ nodemon не найден. Установка...
    call npm install -g nodemon
    echo.
)

:: Создание папки для фильмов
if not exist "films_and_serials\" (
    mkdir "films_and_serials"
)

echo ✅ Запуск в режиме разработки...
echo.
echo 🔄 Сервер будет автоматически перезагружаться при изменении файлов
echo 🌐 http://localhost:3000/index1.html
echo.
echo Для остановки нажмите Ctrl+C
echo.

nodemon server.js

