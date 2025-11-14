const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Обслуживание статических файлов

const FILMS_DIR = path.join(__dirname, 'films_and_serials');
const CATEGORIES_DIR = path.join(__dirname, 'ALL_CATEGORIES');
const CATEGORIES_FILE = path.join(CATEGORIES_DIR, 'categories.json');

// Создание директории для фильмов если её нет
async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Вспомогательная функция для удаления всех файлов в папке
async function clearDirectory(dir) {
    try {
        const files = await fs.readdir(dir);
        await Promise.all(files.map(file => fs.unlink(path.join(dir, file))));
    } catch (error) {
        // Папка не существует или пуста
    }
}

// Настройка multer для загрузки баннера
const bannerStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { id } = req.params;
        const uploadPath = path.join(FILMS_DIR, id, 'banner');
        await ensureDir(uploadPath);
        // Удаляем старые файлы
        await clearDirectory(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Используем фиксированное имя с оригинальным расширением
        cb(null, 'banner' + path.extname(file.originalname));
    }
});

// Настройка multer для загрузки превью
const previewStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { id, previewNumber } = req.params;
        const uploadPath = path.join(FILMS_DIR, id, 'preview', `preview${previewNumber}`);
        await ensureDir(uploadPath);
        // Удаляем старые файлы в этой подпапке
        await clearDirectory(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Используем фиксированное имя с оригинальным расширением
        cb(null, 'preview' + path.extname(file.originalname));
    }
});

const uploadBanner = multer({ storage: bannerStorage });
const uploadPreview = multer({ storage: previewStorage });

// Получить следующий доступный ID
async function getNextId() {
    await ensureDir(FILMS_DIR);
    const files = await fs.readdir(FILMS_DIR);
    const ids = files
        .filter(f => !isNaN(f))
        .map(f => parseInt(f))
        .filter(n => !isNaN(n));
    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
}

// API: Получить все карточки
app.get('/api/films', async (req, res) => {
    try {
        await ensureDir(FILMS_DIR);
        const files = await fs.readdir(FILMS_DIR);
        const filmIds = files.filter(f => !isNaN(f));
        
        const films = await Promise.all(
            filmIds.map(async (id) => {
                try {
                    const dataPath = path.join(FILMS_DIR, id, 'data.json');
                    const data = await fs.readFile(dataPath, 'utf8');
                    return { id, ...JSON.parse(data) };
                } catch {
                    return { id, title: `Фильм ${id}`, rating: 0 };
                }
            })
        );
        
        res.json(films);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Получить конкретную карточку
app.get('/api/films/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filmDir = path.join(FILMS_DIR, id);
        const dataPath = path.join(filmDir, 'data.json');
        
        const data = await fs.readFile(dataPath, 'utf8');
        const filmData = JSON.parse(data);
        
        // Получить пути к файлам
        const banner = await getFiles(path.join(filmDir, 'banner'));
        const preview1 = await getFiles(path.join(filmDir, 'preview', 'preview1'));
        const preview2 = await getFiles(path.join(filmDir, 'preview', 'preview2'));
        const preview3 = await getFiles(path.join(filmDir, 'preview', 'preview3'));
        
        res.json({
            id,
            ...filmData,
            banner: banner[0] || null,
            preview1: preview1[0] || null,
            preview2: preview2[0] || null,
            preview3: preview3[0] || null
        });
    } catch (error) {
        res.status(404).json({ error: 'Film not found' });
    }
});

// Вспомогательная функция для получения файлов
async function getFiles(dir) {
    try {
        const files = await fs.readdir(dir);
        return files.map(f => path.relative(__dirname, path.join(dir, f)));
    } catch {
        return [];
    }
}

// API: Создать новую карточку
app.post('/api/films', async (req, res) => {
    try {
        const id = await getNextId();
        const filmDir = path.join(FILMS_DIR, id.toString());
        
        // Создать структуру папок
        await ensureDir(filmDir);
        await ensureDir(path.join(filmDir, 'banner'));
        await ensureDir(path.join(filmDir, 'preview', 'preview1'));
        await ensureDir(path.join(filmDir, 'preview', 'preview2'));
        await ensureDir(path.join(filmDir, 'preview', 'preview3'));
        
        // Создать базовый data.json
        const initialData = {
            title: req.body.title || `Фильм ${id}`,
            rating: req.body.rating || 0,
            year: req.body.year || '',
            country: req.body.country || '',
            director: req.body.director || '',
            cast: req.body.cast || '',
            mainCategory: req.body.mainCategory || '',
            subCategory: req.body.subCategory || '',
            filmDescription: req.body.filmDescription || '',
            personalReview: req.body.personalReview || '',
            createdAt: new Date().toISOString()
        };
        
        await fs.writeFile(
            path.join(filmDir, 'data.json'),
            JSON.stringify(initialData, null, 2)
        );
        
        // Создать HTML файл
        const htmlContent = await generateFilmHTML(id, initialData);
        await fs.writeFile(path.join(filmDir, 'index.html'), htmlContent);
        
        res.json({ id, ...initialData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Обновить карточку
app.put('/api/films/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filmDir = path.join(FILMS_DIR, id);
        const dataPath = path.join(filmDir, 'data.json');
        
        // Читаем существующие данные
        let existingData = {};
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            existingData = JSON.parse(data);
        } catch {}
        
        // Объединяем с новыми данными
        const updatedData = {
            ...existingData,
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(dataPath, JSON.stringify(updatedData, null, 2));
        
        res.json({ id, ...updatedData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Загрузить баннер
app.post('/api/films/:id/upload/banner', uploadBanner.single('file'), async (req, res) => {
    try {
        const filePath = path.relative(__dirname, req.file.path);
        res.json({ path: filePath, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Загрузить превью (с номером: 1, 2, 3)
app.post('/api/films/:id/upload/preview/:previewNumber', uploadPreview.single('file'), async (req, res) => {
    try {
        const filePath = path.relative(__dirname, req.file.path);
        res.json({ path: filePath, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Удалить карточку
app.delete('/api/films/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const filmDir = path.join(FILMS_DIR, id);
        
        await fs.rm(filmDir, { recursive: true, force: true });
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Генерация HTML для карточки фильма
async function generateFilmHTML(id, data) {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
</head>
<body>
    <h1>${data.title}</h1>
    <p>Рейтинг: ${data.rating}/10</p>
    <a href="../../edit-film.html?id=${id}">Открыть карточку</a>
    <br>
    <a href="../../index1.html">На главную</a>
</body>
</html>`;
}

// === КАТЕГОРИИ ===

// Получить все категории
async function getAllCategories() {
    try {
        await ensureDir(CATEGORIES_DIR);
        const data = await fs.readFile(CATEGORIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

// Сохранить категории
async function saveCategories(categories) {
    await ensureDir(CATEGORIES_DIR);
    await fs.writeFile(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
}

// API: Получить все категории
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Добавить категорию
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Название категории обязательно' });
        }
        
        const categories = await getAllCategories();
        const trimmedName = name.trim();
        
        // Проверка на дубликат
        if (categories.find(c => c.toLowerCase() === trimmedName.toLowerCase())) {
            return res.status(409).json({ error: 'Категория уже существует' });
        }
        
        categories.push(trimmedName);
        await saveCategories(categories);
        
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Удалить категорию
app.delete('/api/categories/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const categories = await getAllCategories();
        const filtered = categories.filter(c => c !== decodeURIComponent(name));
        
        await saveCategories(filtered);
        
        res.json({ success: true, categories: filtered });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    ensureDir(FILMS_DIR);
    ensureDir(CATEGORIES_DIR);
});

