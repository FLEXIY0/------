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

// Создание директории для фильмов если её нет
async function ensureDir(dir) {
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { id, type } = req.params;
        const uploadPath = path.join(FILMS_DIR, id, type);
        await ensureDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

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
        const preview = await getFiles(path.join(filmDir, 'preview'));
        
        res.json({
            id,
            ...filmData,
            banner: banner[0] || null,
            preview: preview[0] || null
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
        await ensureDir(path.join(filmDir, 'preview'));
        await ensureDir(path.join(filmDir, 'description'));
        await ensureDir(path.join(filmDir, 'personal_description'));
        
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
            subCategory2: req.body.subCategory2 || '',
            subCategory3: req.body.subCategory3 || '',
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

// API: Загрузить файл (баннер, превью)
app.post('/api/films/:id/upload/:type', upload.single('file'), async (req, res) => {
    try {
        const filePath = path.relative(__dirname, req.file.path);
        res.json({ path: filePath });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// API: Сохранить текстовое описание
app.post('/api/films/:id/description/:type', async (req, res) => {
    try {
        const { id, type } = req.params;
        const { content } = req.body;
        
        const descDir = path.join(FILMS_DIR, id, type);
        await ensureDir(descDir);
        
        const filePath = path.join(descDir, 'content.txt');
        await fs.writeFile(filePath, content, 'utf8');
        
        res.json({ success: true });
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

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    ensureDir(FILMS_DIR);
});

