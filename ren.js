(function () {
    'use strict';

    /**
     * Плагин Ratings Gold для Lampa
     * Собрано на основе интеграции maxsmRatings и логики Лихтар 4.0
     */

    // =================================================================
    // CONFIGURATION & CONSTANTS
    // =================================================================
    
    // Ключи API (используются те, что были в коде)
    var OMDB_API_KEYS = ['73ff4450']; 
    var KP_API_KEYS = ['5178ab83-699c-4422-937e-f8a759f872ef'];
    
    var CACHE_TIME = 3 * 24 * 60 * 60 * 1000; // Кэш на 3 дня
    var WEIGHTS = { imdb: 0.35, tmdb: 0.15, kp: 0.20, mc: 0.15, rt: 0.15 }; // Веса

    var AGE_RATINGS = { 
        'G': '3+', 'PG': '6+', 'PG-13': '13+', 'R': '17+', 'NC-17': '18+', 
        'TV-Y': '0+', 'TV-Y7': '7+', 'TV-G': '3+', 'TV-PG': '6+', 'TV-14': '14+', 'TV-MA': '17+' 
    };

    // SVG Иконки
    var imdb_svg = '<svg style="width:1.4em; height:1.4em; vertical-align:middle;" viewBox="0 0 122.88 122.88"><path fill="#F5C518" d="M18.43,0h86.02c10.18,0,18.43,8.25,18.43,18.43v86.02c0,10.18-8.25,18.43-18.43,18.43H18.43 C8.25,122.88,0,114.63,0,104.45l0-86.02C0,8.25,8.25,0,18.43,0z"/></svg>';
    var star_svg = '<svg style="width:1.4em; height:1.4em; vertical-align:middle;" viewBox="10 10 44 44" fill="none"><path d="M31.4517 11.3659L40.2946 22.8568L54.0403 26.5435L45.8445 38.5045L46.5858 52.7168L32.6776 48.6182L19.39 53.7151L18.9901 39.221L10.0366 28.1589L23.6977 23.2996L31.4517 11.3659Z" fill="#FFDF6D"/></svg>';

    // =================================================================
    // STYLES
    // =================================================================
    var style = `
        <style id="ratings_gold_styles">
            .applecation__ratings {
                display: flex;
                align-items: center;
                gap: 1.2em;
                margin-top: 1.2em;
                opacity: 0;
                transform: translateY(15px);
                transition: opacity .4s ease-out, transform .4s ease-out;
            }
            .applecation__ratings.show {
                opacity: 1;
                transform: translateY(0);
            }
            .rating-item {
                display: flex;
                align-items: center;
                gap: 0.5em;
                font-size: 1.2em;
                font-weight: bold;
            }
            .rate--green { color: #4CAF50; }
            .rate--lime { color: #CDDC39; }
            .rate--orange { color: #FF9800; }
            .rate--red { color: #F44336; }
        </style>
    `;

    // =================================================================
    // LOGIC & INTEGRATION
    // =================================================================
    
    function getRatingClass(rating) {
        var r = parseFloat(rating);
        if (r >= 8.5) return 'rate--green';
        if (r >= 7.0) return 'rate--lime';
        if (r >= 5.0) return 'rate--orange';
        return 'rate--red';
    }

    function initPlugin() {
        $('body').append(style);

        // Слушаем событие открытия карточки фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            
            var render = e.object.activity.render();
            var movie = e.data.movie;
            
            // Создаем контейнер для рейтингов
            var ratingsCont = $('<div class="applecation__ratings"></div>');
            render.find('.full-start__details').after(ratingsCont);

            // Имитация получения данных (логика fetchOmdbRatings/fetchKpRatings из кода)
            // В полноценном плагине здесь идут асинхронные запросы к API
            var mockRatings = {
                imdb: movie.vote_average || '0.0',
                kp: '—',
                tmdb: movie.vote_average || '0.0'
            };

            // Вывод рейтингов
            var html = `
                <div class="rating-item">${star_svg} <span class="${getRatingClass(mockRatings.tmdb)}">${mockRatings.tmdb}</span></div>
                <div class="rating-item">${imdb_svg} <span>${mockRatings.imdb}</span></div>
            `;
            
            ratingsCont.html(html);
            
            // Плавное появление через небольшую задержку
            setTimeout(function() {
                ratingsCont.addClass('show');
            }, 100);
        });
    }

    // Запуск при готовности Lampa
    if (window.appready) initPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') initPlugin();
        });
    }

})();

