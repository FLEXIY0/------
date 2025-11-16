/**
 * Пример серверного кода для поддержки системы тем
 * Добавьте эти endpoints в ваш существующий server.js
 */

const fs = require('fs').promises;
const path = require('path');

// Путь к файлу настроек
const SETTINGS_PATH = path.join(__dirname, 'settings.json');

// GET /api/settings - Получение настроек темы
app.get('/api/settings', async (req, res) => {
    try {
        // Пытаемся прочитать файл настроек
        const settingsData = await fs.readFile(SETTINGS_PATH, 'utf8');
        const settings = JSON.parse(settingsData);
        res.json(settings);
    } catch (error) {
        // Если файл не существует, возвращаем дефолтные настройки
        if (error.code === 'ENOENT') {
            const defaultSettings = {
                theme: {
                    backgroundColor: '#141414',
                    primaryColor: '#212121',
                    secondaryColor: '#2a2a2a',
                    accentColor: '#3e3e3e',
                    textPrimary: '#B8B8B8',
                    textSecondary: '#9E9E9E',
                    textTertiary: '#848484',
                    textMuted: '#6e6e6e'
                },
                customSettings: {
                    enableCustomTheme: false
                }
            };
            
            // Создаем файл с дефолтными настройками
            await fs.writeFile(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2), 'utf8');
            res.json(defaultSettings);
        } else {
            console.error('Ошибка чтения настроек:', error);
            res.status(500).json({ error: 'Ошибка загрузки настроек' });
        }
    }
});

// POST /api/settings - Сохранение настроек темы
app.post('/api/settings', async (req, res) => {
    try {
        const { theme } = req.body;
        
        if (!theme) {
            return res.status(400).json({ error: 'Не переданы данные темы' });
        }
        
        // Валидация данных темы
        const requiredFields = [
            'backgroundColor',
            'primaryColor',
            'secondaryColor',
            'accentColor',
            'textPrimary',
            'textSecondary',
            'textTertiary',
            'textMuted'
        ];
        
        for (const field of requiredFields) {
            if (!theme[field]) {
                return res.status(400).json({ 
                    error: `Отсутствует обязательное поле: ${field}` 
                });
            }
            
            // Проверка формата цвета (должен быть HEX)
            if (!/^#[0-9A-Fa-f]{6}$/i.test(theme[field])) {
                return res.status(400).json({ 
                    error: `Неверный формат цвета для поля: ${field}` 
                });
            }
        }
        
        // Читаем текущие настройки
        let settings;
        try {
            const settingsData = await fs.readFile(SETTINGS_PATH, 'utf8');
            settings = JSON.parse(settingsData);
        } catch (error) {
            // Если файл не существует, создаем новый объект
            settings = {
                theme: {},
                customSettings: {
                    enableCustomTheme: true
                }
            };
        }
        
        // Обновляем тему
        settings.theme = theme;
        settings.customSettings.enableCustomTheme = true;
        
        // Сохраняем в файл
        await fs.writeFile(
            SETTINGS_PATH, 
            JSON.stringify(settings, null, 2), 
            'utf8'
        );
        
        res.json({ 
            success: true, 
            message: 'Настройки темы сохранены',
            theme: settings.theme
        });
        
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        res.status(500).json({ error: 'Ошибка сохранения настроек' });
    }
});

// PUT /api/settings/reset - Сброс темы к дефолтной
app.put('/api/settings/reset', async (req, res) => {
    try {
        const defaultSettings = {
            theme: {
                backgroundColor: '#141414',
                primaryColor: '#212121',
                secondaryColor: '#2a2a2a',
                accentColor: '#3e3e3e',
                textPrimary: '#B8B8B8',
                textSecondary: '#9E9E9E',
                textTertiary: '#848484',
                textMuted: '#6e6e6e'
            },
            customSettings: {
                enableCustomTheme: false
            }
        };
        
        await fs.writeFile(
            SETTINGS_PATH, 
            JSON.stringify(defaultSettings, null, 2), 
            'utf8'
        );
        
        res.json({ 
            success: true, 
            message: 'Тема сброшена к дефолтной',
            theme: defaultSettings.theme
        });
        
    } catch (error) {
        console.error('Ошибка сброса настроек:', error);
        res.status(500).json({ error: 'Ошибка сброса настроек' });
    }
});

/**
 * Middleware для логирования запросов к настройкам (опционально)
 */
app.use('/api/settings', (req, res, next) => {
    console.log(`[Theme Settings] ${req.method} ${req.path}`);
    next();
});

module.exports = {
    // Экспортируем функции, если нужно использовать их в других местах
    getSettings: async () => {
        try {
            const settingsData = await fs.readFile(SETTINGS_PATH, 'utf8');
            return JSON.parse(settingsData);
        } catch (error) {
            return null;
        }
    },
    
    saveSettings: async (theme) => {
        const settings = {
            theme,
            customSettings: {
                enableCustomTheme: true
            }
        };
        await fs.writeFile(
            SETTINGS_PATH, 
            JSON.stringify(settings, null, 2), 
            'utf8'
        );
        return settings;
    }
};

