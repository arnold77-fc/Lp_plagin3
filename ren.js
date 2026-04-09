(function () {
    'use strict';

    // 1. СТИЛИ (Обязательно для видимости плашек)
    var styleBlock = `
        <style>
            .quality-badge {
                display: inline-flex !important;
                align-items: center !important;
                padding: 4px 8px !important;
                margin-right: 6px !important;
                background: rgba(255, 255, 255, 0.15) !important;
                border-radius: 5px !important;
                font-size: 13px !important;
                font-weight: bold !important;
                color: #fff !important;
                text-transform: uppercase;
            }
            .badge--4k { background: #e50914 !important; } /* Красный для 4K */
            .badge--fhd { background: #339999 !important; } /* Бирюзовый для 1080p */
            .badge--ua { background: #0057b7 !important; color: #ffd700 !important; } /* Сине-желтый для UA */
            
            .plugin-ratings {
                display: flex;
                gap: 15px;
                margin: 10px 0;
                font-size: 16px;
                font-weight: 500;
            }
            .rating-item { display: flex; align-items: center; gap: 5px; }
            .rating-kp { color: #f50; }
            .rating-imdb { color: #f5c518; }
        </style>
    `;

    // 2. ЛОГИКА ОПРЕДЕЛЕНИЯ КАЧЕСТВА (Извлечено из вашего кода)
    function getQualityInfo(movie) {
        var title = (movie.title || movie.name || '').toLowerCase();
        var quality = 'SD';
        
        if (title.indexOf('4k') >= 0 || title.indexOf('2160') >= 0 || title.indexOf('uhd') >= 0) quality = '4K';
        else if (title.indexOf('1080') >= 0 || title.indexOf('fhd') >= 0) quality = 'FHD';
        else if (title.indexOf('720') >= 0 || title.indexOf('hd') >= 0) quality = 'HD';

        return {
            label: quality,
            isUa: (title.indexOf('ukr') >= 0 || title.indexOf('укр') >= 0 || title.indexOf('ua') >= 0)
        };
    }

    // 3. ПОЛУЧЕНИЕ РЕЙТИНГОВ (Кинопоиск / IMDB)
    function loadRatings(movie, container) {
        var kp_key = '2ed29580-9942-45fd-96d5-6b3a3297b69c'; // Ваш ключ из кода
        var title = movie.title || movie.name;
        var year = (movie.release_date || movie.first_air_date || '0000').substring(0, 4);

        var url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(title);

        fetch(url, { headers: { 'X-API-KEY': kp_key } })
            .then(r => r.json())
            .then(data => {
                var match = data.films ? data.films.find(f => f.year == year) : null;
                if (match && match.rating && match.rating !== 'null') {
                    var html = `<div class="plugin-ratings">
                        <span class="rating-item rating-kp">KP: ${match.rating}</span>
                        ${movie.vote_average ? `<span class="rating-item">TMDB: ${movie.vote_average.toFixed(1)}</span>` : ''}
                    </div>`;
                    container.prepend(html);
                }
            }).catch(e => console.log('Rating error', e));
    }

    // 4. ИНИЦИАЛИЗАЦИЯ И ИНЪЕКЦИЯ
    function startPlugin() {
        $('body').append(styleBlock);

        // Слушаем открытие карточки фильма
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var render = e.object.activity.render();
                var movie = e.data.movie;

                // Создаем контейнер в разделе инфо (там где обычно пусто)
                var container = render.find('.full-start-new__rate-line'); 
                if (!container.length) container = render.find('.full-start__rate');

                // Очищаем старое (на всякий случай) и добавляем новое
                var info = getQualityInfo(movie);
                var badgesHtml = '<div class="plugin-quality-badges" style="margin-bottom: 10px;">';
                
                if (info.label !== 'SD') {
                    var cls = info.label === '4K' ? 'badge--4k' : 'badge--fhd';
                    badgesHtml += `<span class="quality-badge ${cls}">${info.label}</span>`;
                }
                
                if (info.isUa) {
                    badgesHtml += `<span class="quality-badge badge--ua">UA Озвучка</span>`;
                }
                badgesHtml += '</div>';

                container.after(badgesHtml);
                loadRatings(movie, container);
            }
        });
    }

    // Запуск при готовности Lampa
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
