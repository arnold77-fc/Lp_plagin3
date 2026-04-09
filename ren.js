(function () {
    'use strict';

    /**
     * Плагин Ratings & Quality для Lampa
     * Выделено из Flixio Studios
     */

    // --- Конфигурация и локализация ---
    var LANG = (Lampa.Storage.get('language', 'ru') || 'ru').toLowerCase();
    var I18N = {
        rating_title: { uk: 'Рейтинг та якість', ru: 'Рейтинг и качество', en: 'Rating & Quality' },
        loading: { uk: 'Завантаження...', ru: 'Загрузка...', en: 'Loading...' }
    };

    function tr(key) {
        return I18N[key] ? (I18N[key][LANG] || I18N[key]['ru']) : key;
    }

    // --- Стили (извлечены из вашего кода) ---
    var styles = `
        <style>
            .quality-badge {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                padding: 4px 6px !important;
                background: rgba(255, 255, 255, 0.2) !important;
                border-radius: 4px !important;
                font-size: 12px !important;
                font-weight: 500 !important;
                color: #fff !important;
                margin-right: 5px !important;
                line-height: 1 !important;
            }
            .quality-badge--res { background: #339999 !important; }
            .quality-badge--dv { background: #ff5722 !important; }
            .quality-badge--dub { background: #4caf50 !important; }
            
            .card__badge--custom {
                position: absolute !important;
                z-index: 10 !important;
                background: rgba(0,0,0,0.7) !important;
                padding: 2px 5px !important;
                font-size: 10px !important;
                border-radius: 3px !important;
            }
            .card__badge--season { top: 5px; left: 5px; background: #e50914 !important; }
        </style>
    `;

    // --- Логика определения качества (извлечена из snippet_7, snippet_11) ---
    function getQualityFromTitle(title) {
        var t = (title || '').toLowerCase();
        if (t.indexOf('4k') >= 0 || t.indexOf('2160') >= 0 || t.indexOf('uhd') >= 0) return '4K';
        if (t.indexOf('1080') >= 0 || t.indexOf('fhd') >= 0) return 'FHD';
        if (t.indexOf('720') >= 0 || t.indexOf('hd') >= 0) return 'HD';
        return 'SD';
    }

    // --- Логика рейтингов Кинопоиска (извлечена из snippet_12) ---
    function fetchKP(movie, callback) {
        var apiKey = '2ed29580-9942-45fd-96d5-6b3a3297b69c'; // Используем ваш ключ из кода
        var title = movie.title || movie.name;
        var year = movie.release_date ? movie.release_date.split('-')[0] : (movie.first_air_date ? movie.first_air_date.split('-')[0] : '');
        
        var url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(title);
        
        fetch(url, { headers: { 'X-API-KEY': apiKey } })
            .then(r => r.json())
            .then(data => {
                var match = data.films ? data.films.find(f => f.year == year) : null;
                if (match) {
                    callback({ kp: match.rating, imdb: null });
                } else {
                    callback(null);
                }
            }).catch(() => callback(null));
    }

    // --- Инъекция в интерфейс Lampa ---
    function init() {
        $('body').append(styles);

        // Слушатель открытия карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                var movie = e.data.movie;

                // Добавляем контейнер для баджей, если его нет
                if (!render.find('.quality-badges-container').length) {
                    render.find('.full-start-new__rate-line').after('<div class="quality-badges-container" style="margin-top:10px"></div>');
                }

                // 1. Отображаем качество
                var quality = getQualityFromTitle(movie.title || movie.name);
                if (quality !== 'SD') {
                    render.find('.quality-badges-container').append('<div class="quality-badge quality-badge--res">' + quality + '</div>');
                }

                // 2. Загружаем рейтинги
                fetchKP(movie, function(ratings) {
                    if (ratings && ratings.kp) {
                        render.find('.full-start__rate').append('<span class="kp-rating" style="margin-left:10px; color:#f50">KP: ' + ratings.kp + '</span>');
                    }
                });
            }
        });

        // Добавляем баджи на карточки в списках (из snippet_8)
        Lampa.Listener.follow('card', function (e) {
            if (e.type === 'visible') {
                var card = $(e.el);
                var movie = e.data;
                if (movie.number_of_seasons) {
                    card.find('.card__view').append('<div class="card__badge--custom card__badge--season">S' + movie.number_of_seasons + '</div>');
                }
            }
        });
    }

    // Регистрация в настройках
    if (Lampa.SettingsApi) {
        Lampa.SettingsApi.addComponent({
            component: 'quality_rating_plugin',
            name: tr('rating_title'),
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="white"/></svg>'
        });
    }

    // Запуск
    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
