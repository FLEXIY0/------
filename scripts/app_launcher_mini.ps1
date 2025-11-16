# Минималистичный launcher для PowerShell
# Можно скомпилировать в EXE с помощью ps2exe

param(
    [int]$Port = 3000
)

$AppTitle = "Менеджер Фильмов и Сериалов"
$Host.UI.RawUI.WindowTitle = $AppTitle

function Write-ColorText {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

function Test-PortInUse {
    param([int]$Port)
    
    $tcpConnection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $tcpConnection -ne $null
}

function Start-NodeServer {
    Write-ColorText "🔄 Запуск сервера..." "Yellow"
    
    # Проверяем Node.js
    $nodeExists = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeExists) {
        Write-ColorText "❌ Node.js не найден!" "Red"
        Write-ColorText "   Установите с https://nodejs.org/" "Yellow"
        Read-Host "Нажмите Enter для выхода"
        exit 1
    }
    
    # Запускаем сервер
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru
    
    # Ждем запуска
    $attempts = 0
    $maxAttempts = 30
    
    while ($attempts -lt $maxAttempts) {
        if (Test-PortInUse -Port $Port) {
            Write-ColorText "✅ Сервер запущен на http://localhost:$Port" "Green"
            return $serverProcess
        }
        Start-Sleep -Milliseconds 500
        $attempts++
    }
    
    Write-ColorText "❌ Не удалось запустить сервер" "Red"
    return $null
}

function Open-InBrowser {
    param([string]$Url)
    
    Write-ColorText "🌐 Открываю приложение..." "Cyan"
    
    # Ищем Chrome
    $chromePaths = @(
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
        "$env:PROGRAMFILES\Google\Chrome\Application\chrome.exe",
        "${env:PROGRAMFILES(X86)}\Google\Chrome\Application\chrome.exe"
    )
    
    foreach ($chromePath in $chromePaths) {
        if (Test-Path $chromePath) {
            Write-ColorText "🚀 Запуск в Chrome App Mode..." "Green"
            Start-Process -FilePath $chromePath -ArgumentList "--app=$Url", "--window-size=1400,900"
            return
        }
    }
    
    # Пробуем Edge
    $edgePath = "$env:PROGRAMFILES\Microsoft\Edge\Application\msedge.exe"
    if (Test-Path $edgePath) {
        Write-ColorText "🚀 Запуск в Edge App Mode..." "Green"
        Start-Process -FilePath $edgePath -ArgumentList "--app=$Url", "--window-size=1400,900"
        return
    }
    
    # Открываем в браузере по умолчанию
    Write-ColorText "🚀 Открытие в браузере по умолчанию..." "Yellow"
    Start-Process $Url
}

# Главная функция
function Main {
    Clear-Host
    
    Write-Host ""
    Write-ColorText "═══════════════════════════════════════════" "Cyan"
    Write-ColorText "  $AppTitle" "White"
    Write-ColorText "═══════════════════════════════════════════" "Cyan"
    Write-Host ""
    
    # Проверяем, не запущен ли уже сервер
    if (Test-PortInUse -Port $Port) {
        Write-ColorText "⚠️  Сервер уже запущен на порту $Port" "Yellow"
        Write-ColorText "🌐 Открываю приложение..." "Cyan"
        Open-InBrowser "http://localhost:$Port/index1.html"
        return
    }
    
    # Запускаем сервер
    $serverProcess = Start-NodeServer
    
    if ($null -eq $serverProcess) {
        Read-Host "Нажмите Enter для выхода"
        exit 1
    }
    
    Start-Sleep -Seconds 1
    
    # Открываем в браузере
    Open-InBrowser "http://localhost:$Port/index1.html"
    
    Write-Host ""
    Write-ColorText "───────────────────────────────────────────" "Gray"
    Write-ColorText "✨ Приложение запущено!" "Green"
    Write-ColorText "📍 URL: http://localhost:$Port/index1.html" "Gray"
    Write-ColorText "🛑 Для остановки закройте это окно" "Gray"
    Write-ColorText "───────────────────────────────────────────" "Gray"
    Write-Host ""
    
    # Ждем нажатия клавиши
    Read-Host "Нажмите Enter для остановки сервера"
    
    # Останавливаем сервер
    if ($null -ne $serverProcess) {
        Write-ColorText "`n🛑 Остановка сервера..." "Yellow"
        Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-ColorText "✅ Готово!" "Green"
}

# Запуск
Main

