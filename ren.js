
(function () {
    'use strict';

    // 1. Уникальные настройки и локализация
    var PLUGIN_NAME = 'flixio_quality_rating';
    var LANG = (Lampa.Storage.get('language', 'ru') || 'ru').toLowerCase();
    
    var Labels = {
        title: { ru: 'Рейтинг и качество', uk: 'Рейтинг та якість', en: 'Rating & Quality' }
    };

    function msg(key) {
        return Labels.title[LANG] || Labels.title['ru'];
    }

    // 2. Стили (извлечены из вашего кода)
    var styles = `
        <style>
            .flix-rating-line { 
                display: flex; 
                flex-wrap: wrap; 
                gap: 10px; 
                margin: 10px 0; 
                align-items: center;
            }
            .flix-badge {
                padding: 4px 8px;
                border-radius: 4px;
                background: rgba(255,255,255,0.2);
                color: #fff;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            .flix-badge--4k { background: #e50914 !important; }
            .flix-badge--fhd { background: #339999 !important; }
            .flix-badge--ua { background: #0057b7 !important; color: #ffd700 !important; border: 1px solid #ffd700; }
            .flix-kp { color: #f50; font-weight: bold; font-size: 16px; }
            .flix-imdb { color: #f5c518; font-weight: bold; font-size: 16px; }
        </style>
    `;

    // 3. Логика получения данных
    function getQuality(title) {
        var t = (title || '').toLowerCase();
        if (t.indexOf('4k') > -1 || t.indexOf('2160') > -1) return '4K';
        if (t.indexOf('1080') > -1 || t.indexOf('fhd') > -1) return 'FHD';
        if (t.indexOf('720') > -1 || t.indexOf('hd') > -1) return 'HD';
        return '';
    }

    function isUa(title) {
        var t = (title || '').toLowerCase();
        return t.indexOf('ukr') > -1 || t.indexOf('укр') > -1 || t.indexOf('ua') > -1;
    }

    // 4. Основная функция отрисовки
    function injectData(render, movie) {
        // Ищем место для вставки (совместимость с разными версиями Lampa)
        var target = render.find('.full-start-new__rate-line, .full-start__rate');
        if (!target.length) return;

        // Чтобы не дублировать при повторном открытии
        if (render.find('.flix-rating-line').length) return;

        var container = $('<div class="flix-rating-line"></div>');
        
        // Качество
        var q = getQuality(movie.title || movie.name);
        if (q) {
            var qCls = (q === '4K') ? 'flix-badge--4k' : 'flix-badge--fhd';
            container.append('<div class="flix-badge '+qCls+'">'+q+'</div>');
        }

        // Озвучка UA
        if (isUa(movie.title || movie.name)) {
            container.append('<div class="flix-badge flix-badge--ua">UA</div>');
        }

        target.after(container);

        // Запрос рейтинга Кинопоиск (Ваш API ключ из кода)
        var kp_api = '2ed29580-9942-45fd-96d5-6b3a3297b69c';
        var year = (movie.release_date || movie.first_air_date || '').split('-')[0];
        var query = encodeURIComponent(movie.title || movie.name);

        fetch('https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + query, {
            headers: { 'X-API-KEY': kp_api }
        })
        .then(r => r.json())
        .then(data => {
            var found = data.films ? data.films.find(f => f.year == year) : null;
            if (found && found.rating && found.rating !== 'null') {
                container.append('<div class="flix-kp">KP: ' + found.rating + '</div>');
            }
        }).catch(e => {});
    }

    // 5. Регистрация в Lampa
    function init() {
        $('body').append(styles);

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                injectData(e.object.activity.render(), e.data.movie);
            }
        });

        // Добавляем пункт в настройки, чтобы он не пропадал
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: PLUGIN_NAME,
                name: msg('title'),
                icon: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="white"/></svg>'
            });
        }
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }

})();
