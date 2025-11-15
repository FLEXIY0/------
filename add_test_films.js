const http = require('http');

// Массив тестовых фильмов
const testFilms = [
    {
        title: "Побег из Шоушенка",
        rating: 10,
        country: "США",
        year: "1994",
        director: "Фрэнк Дарабонт",
        cast: "Тим Роббинс, Морган Фриман",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["триллер"],
        filmDescription: "История о надежде и дружбе в тюрьме строгого режима"
    },
    {
        title: "Форрест Гамп",
        rating: 9,
        country: "США",
        year: "1994",
        director: "Роберт Земекис",
        cast: "Том Хэнкс, Робин Райт",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["комедия"],
        filmDescription: "История простого человека, ставшего свидетелем важнейших событий XX века"
    },
    {
        title: "Интерстеллар",
        rating: 9,
        country: "США",
        year: "2014",
        director: "Кристофер Нолан",
        cast: "Мэттью Макконахи, Энн Хэтэуэй",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["драма"],
        filmDescription: "Космическое путешествие в поисках нового дома для человечества"
    },
    {
        title: "Темный рыцарь",
        rating: 10,
        country: "США",
        year: "2008",
        director: "Кристофер Нолан",
        cast: "Кристиан Бэйл, Хит Леджер",
        contentType: "movie",
        mainCategory: "боевик",
        subCategories: ["драма", "криминал"],
        filmDescription: "Бэтмен противостоит Джокеру в борьбе за душу Готэма"
    },
    {
        title: "Начало",
        rating: 8,
        country: "США",
        year: "2010",
        director: "Кристофер Нолан",
        cast: "Леонардо ДиКаприо, Том Харди",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["триллер", "боевик"],
        filmDescription: "Воры, проникающие в сны людей для извлечения секретов"
    },
    {
        title: "Матрица",
        rating: 9,
        country: "США",
        year: "1999",
        director: "Братья Вачовски",
        cast: "Киану Ривз, Лоуренс Фишборн",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["боевик"],
        filmDescription: "Хакер узнает правду о реальности и своей роли в войне против машин"
    },
    {
        title: "Криминальное чтиво",
        rating: 8,
        country: "США",
        year: "1994",
        director: "Квентин Тарантино",
        cast: "Джон Траволта, Сэмюэл Л. Джексон",
        contentType: "movie",
        mainCategory: "криминал",
        subCategories: ["драма", "триллер"],
        filmDescription: "Переплетенные истории преступников Лос-Анджелеса"
    },
    {
        title: "Бойцовский клуб",
        rating: 9,
        country: "США",
        year: "1999",
        director: "Дэвид Финчер",
        cast: "Эдвард Нортон, Брэд Питт",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["триллер"],
        filmDescription: "История о подпольном бойцовском клубе и анархистском движении"
    },
    {
        title: "Во все тяжкие",
        rating: 10,
        country: "США",
        year: "2008",
        director: "Винс Гиллиган",
        cast: "Брайан Крэнстон, Аарон Пол",
        contentType: "series",
        mainCategory: "драма",
        subCategories: ["криминал", "триллер"],
        filmDescription: "Учитель химии начинает производить наркотики после диагноза рака"
    },
    {
        title: "Игра престолов",
        rating: 8,
        country: "США",
        year: "2011",
        director: "Дэвид Бениофф",
        cast: "Эмилия Кларк, Кит Харингтон",
        contentType: "series",
        mainCategory: "фэнтези",
        subCategories: ["драма", "боевик"],
        filmDescription: "Борьба за Железный трон в мире Вестероса"
    },
    {
        title: "Зеленая миля",
        rating: 9,
        country: "США",
        year: "1999",
        director: "Фрэнк Дарабонт",
        cast: "Том Хэнкс, Майкл Кларк Дункан",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["фэнтези"],
        filmDescription: "Надзиратель тюрьмы встречает заключенного с необычными способностями"
    },
    {
        title: "Список Шиндлера",
        rating: 10,
        country: "США",
        year: "1993",
        director: "Стивен Спилберг",
        cast: "Лиам Нисон, Бен Кингсли",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["история"],
        filmDescription: "Реальная история немецкого бизнесмена, спасшего евреев во время Холокоста"
    },
    {
        title: "Гладиатор",
        rating: 8,
        country: "США",
        year: "2000",
        director: "Ридли Скотт",
        cast: "Рассел Кроу, Хоакин Феникс",
        contentType: "movie",
        mainCategory: "боевик",
        subCategories: ["драма", "история"],
        filmDescription: "Римский генерал становится гладиатором, чтобы отомстить императору"
    },
    {
        title: "Леон",
        rating: 9,
        country: "Франция",
        year: "1994",
        director: "Люк Бессон",
        cast: "Жан Рено, Натали Портман",
        contentType: "movie",
        mainCategory: "боевик",
        subCategories: ["драма", "криминал"],
        filmDescription: "Профессиональный киллер берет под опеку девочку после убийства ее семьи"
    },
    {
        title: "Амели",
        rating: 8,
        country: "Франция",
        year: "2001",
        director: "Жан-Пьер Жёне",
        cast: "Одри Тоту, Матьё Кассовиц",
        contentType: "movie",
        mainCategory: "комедия",
        subCategories: ["драма"],
        filmDescription: "Застенчивая парижанка решает изменить жизнь окружающих к лучшему"
    },
    {
        title: "Остров проклятых",
        rating: 8,
        country: "США",
        year: "2010",
        director: "Мартин Скорсезе",
        cast: "Леонардо ДиКаприо, Марк Руффало",
        contentType: "movie",
        mainCategory: "триллер",
        subCategories: ["детектив", "драма"],
        filmDescription: "Детектив расследует исчезновение пациентки из психиатрической больницы"
    },
    {
        title: "Престиж",
        rating: 9,
        country: "США",
        year: "2006",
        director: "Кристофер Нолан",
        cast: "Хью Джекман, Кристиан Бэйл",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["триллер", "фантастика"],
        filmDescription: "Соперничество двух фокусников в викторианском Лондоне"
    },
    {
        title: "Oldboy",
        rating: 8,
        country: "Южная Корея",
        year: "2003",
        director: "Пак Чхан Ук",
        cast: "Чхве Мин Сик, Ю Чжи Тхэ",
        contentType: "movie",
        mainCategory: "триллер",
        subCategories: ["драма", "боевик"],
        filmDescription: "Человек, освободившийся после 15 лет заточения, ищет ответы"
    },
    {
        title: "Паразиты",
        rating: 9,
        country: "Южная Корея",
        year: "2019",
        director: "Пон Джун Хо",
        cast: "Сон Кан Хо, Ли Сон Гюн",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["триллер", "комедия"],
        filmDescription: "Бедная семья устраивается работать в дом богатых работодателей"
    },
    {
        title: "Звездные войны: Эпизод 5",
        rating: 9,
        country: "США",
        year: "1980",
        director: "Ирвин Кершнер",
        cast: "Марк Хэмилл, Харрисон Форд",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["боевик", "приключения"],
        filmDescription: "Повстанцы сражаются с Империей в далекой галактике"
    },
    {
        title: "Терминатор 2",
        rating: 9,
        country: "США",
        year: "1991",
        director: "Джеймс Кэмерон",
        cast: "Арнольд Шварценеггер, Линда Хэмилтон",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["боевик"],
        filmDescription: "Киборг из будущего защищает мальчика от более совершенного терминатора"
    },
    {
        title: "Город грехов",
        rating: 8,
        country: "США",
        year: "2005",
        director: "Роберт Родригес",
        cast: "Брюс Уиллис, Микки Рурк",
        contentType: "movie",
        mainCategory: "криминал",
        subCategories: ["боевик", "триллер"],
        filmDescription: "Переплетенные истории о коррумпированном городе"
    },
    {
        title: "Седьмая печать",
        rating: 7,
        country: "Швеция",
        year: "1957",
        director: "Ингмар Бергман",
        cast: "Макс фон Сюдов, Гуннар Бьёрнстранд",
        contentType: "movie",
        mainCategory: "драма",
        subCategories: ["фэнтези"],
        filmDescription: "Рыцарь играет в шахматы со Смертью"
    },
    {
        title: "Бегущий по лезвию",
        rating: 8,
        country: "США",
        year: "1982",
        director: "Ридли Скотт",
        cast: "Харрисон Форд, Рутгер Хауэр",
        contentType: "movie",
        mainCategory: "фантастика",
        subCategories: ["триллер"],
        filmDescription: "Охотник за репликантами в антиутопическом будущем"
    },
    {
        title: "Чернобыль",
        rating: 10,
        country: "США",
        year: "2019",
        director: "Йохан Ренк",
        cast: "Джаред Харрис, Стеллан Скарсгард",
        contentType: "series",
        mainCategory: "драма",
        subCategories: ["история"],
        filmDescription: "Драматизация катастрофы на Чернобыльской АЭС"
    },
    {
        title: "Бэтмен: Начало",
        rating: 7,
        country: "США",
        year: "2005",
        director: "Кристофер Нолан",
        cast: "Кристиан Бэйл, Майкл Кейн",
        contentType: "movie",
        mainCategory: "боевик",
        subCategories: ["драма"],
        filmDescription: "История становления Темного рыцаря"
    },
    {
        title: "Дюнкерк",
        rating: 7,
        country: "США",
        year: "2017",
        director: "Кристофер Нолан",
        cast: "Фионн Уайтхед, Том Харди",
        contentType: "movie",
        mainCategory: "военный",
        subCategories: ["драма", "история"],
        filmDescription: "Эвакуация союзных войск из Дюнкерка в 1940 году"
    },
    {
        title: "Властелин колец: Братство кольца",
        rating: 9,
        country: "Новая Зеландия",
        year: "2001",
        director: "Питер Джексон",
        cast: "Элайджа Вуд, Иэн Маккеллен",
        contentType: "movie",
        mainCategory: "фэнтези",
        subCategories: ["приключения", "боевик"],
        filmDescription: "Хоббит должен уничтожить могущественное кольцо"
    },
    {
        title: "Джентльмены",
        rating: 8,
        country: "Великобритания",
        year: "2019",
        director: "Гай Ричи",
        cast: "Мэттью Макконахи, Хью Грант",
        contentType: "movie",
        mainCategory: "криминал",
        subCategories: ["комедия", "боевик"],
        filmDescription: "Американский эмигрант пытается продать свою марихуановую империю"
    },
    {
        title: "Безумный Макс: Дорога ярости",
        rating: 8,
        country: "Австралия",
        year: "2015",
        director: "Джордж Миллер",
        cast: "Том Харди, Шарлиз Терон",
        contentType: "movie",
        mainCategory: "боевик",
        subCategories: ["фантастика", "приключения"],
        filmDescription: "Погоня через пустошь в постапокалиптическом мире"
    }
];

// Функция для отправки POST запроса
function postFilm(filmData) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(filmData);
        
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/films',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        
        const req = http.request(options, (res) => {
            let responseBody = '';
            
            res.on('data', (chunk) => {
                responseBody += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200 || res.statusCode === 201) {
                    resolve(JSON.parse(responseBody));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${responseBody}`));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.write(data);
        req.end();
    });
}

// Добавление фильмов по очереди
async function addAllFilms() {
    console.log('===============================================================');
    console.log('           ADDING TEST FILMS TO DATABASE');
    console.log('===============================================================');
    console.log('');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < testFilms.length; i++) {
        const film = testFilms[i];
        try {
            console.log(`[${i + 1}/${testFilms.length}] Adding: "${film.title}"...`);
            const result = await postFilm(film);
            console.log(`    [OK] Added with ID: ${result.id}`);
            successCount++;
            // Небольшая задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.log(`    [ERROR] Failed: ${error.message}`);
            errorCount++;
        }
    }
    
    console.log('');
    console.log('===============================================================');
    console.log('                      SUMMARY');
    console.log('===============================================================');
    console.log(`Total films processed: ${testFilms.length}`);
    console.log(`Successfully added:    ${successCount}`);
    console.log(`Errors:                ${errorCount}`);
    console.log('===============================================================');
}

// Запуск
addAllFilms().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

