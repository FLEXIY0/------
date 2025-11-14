@echo off
chcp 65001 >nul
title Миграция данных - Очистка старых папок
color 0E

echo ========================================
echo   Миграция структуры фильмов
echo ========================================
echo.
echo Эта утилита удалит старые ненужные папки:
echo   - description/
echo   - personal_description/
echo.
echo Все данные теперь хранятся в data.json
echo.
echo ⚠️  ВНИМАНИЕ: Убедитесь, что у вас есть резервная копия!
echo.
pause

echo.
echo 🔍 Поиск папок для удаления...
echo.

set count=0

for /d %%D in ("films_and_serials\*") do (
    if exist "%%D\description\" (
        echo Удаление %%D\description\
        rmdir /s /q "%%D\description"
        set /a count+=1
    )
    if exist "%%D\personal_description\" (
        echo Удаление %%D\personal_description\
        rmdir /s /q "%%D\personal_description"
        set /a count+=1
    )
)

echo.
if %count% GTR 0 (
    echo ✅ Удалено папок: %count%
) else (
    echo ✓ Ненужных папок не найдено
)
echo.
echo ========================================
echo   Миграция завершена!
echo ========================================
echo.
pause

