(function () {
    'use strict';

    // Константы
    var network = new Lampa.Reguest();
    var kp_key = '2ed29580-9942-45fd-96d5-6b3a3297b69c';

    // 1. Стили
    var style = `
        <style>
            .flix-quality-line { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; align-items: center; }
            .flix-item { padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-weight: bold; }
            .flix-res-4k { background: #e50914 !important; }
            .flix-res-fhd { background: #00897b !important; }
            .flix-ua { background: #0057b7 !important; border: 1px solid #ffd700; color: #ffd700 !important; }
            .flix-rating { font-size: 16px; font-weight: bold; margin-left: 5px; }
            .flix-kp-color { color: #ff5c00; }
        </style>
    `;

    // 2. Логика парсинга
    function getInfo(movie) {
        var str = (movie.title || movie.name || '').toLowerCase();
        var res = '';
        if (str.indexOf('4k') > -1 || str.indexOf('2160') > -1) res = '4K';
        else if (str.indexOf('1080') > -1) res = 'FHD';
        else if (str.indexOf('720') > -1) res = 'HD';

        return {
            quality: res,
            isUa: /ukr|укр|ua|uk/.test(str)
        };
    }

    // 3. Функция отрисовки в карточке
    function renderBadges(render, movie) {
        if (render.find('.flix-quality-line').length) return;

        var target = render.find('.full-start-new__rate-line, .full-start__rate').first();
        if (!target.length) return;

        var info = getInfo(movie);
        var container = $('<div class="flix-quality-line"></div>');

        if (info.quality) {
            var cls = info.quality === '4K' ? 'flix-res-4k' : 'flix-res-fhd';
            container.append('<div class="flix-item ' + cls + '">' + info.quality + '</div>');
        }

        if (info.isUa) {
            container.append('<div class="flix-item flix-ua">UA</div>');
        }

        target.after(container);

        // Загрузка КП
        var year = (movie.release_date || movie.first_air_date || '').split('-')[0];
        var url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(movie.title || movie.name);
        
        network.silent(url, function(data) {
            var found = data.films ? data.films.find(function(f) { return f.year == year; }) : null;
            if (found && found.rating && found.rating !== 'null') {
                container.append('<div class="flix-rating flix-kp-color">КП: ' + found.rating + '</div>');
            }
        }, function() {}, false, { headers: { 'X-API-KEY': kp_key } });
    }

    // 4. Регистрация настроек
    function addSettings() {
        // Добавляем описание компонента
        Lampa.Settings.create({
            url: 'quality_plugin',
            title: 'Рейтинг и качество',
            icon: '<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="white"/></svg>'
        });

        // Создаем сам пункт в главном меню настроек
        Lampa.Params.select('quality_plugin_status', [
            { title: 'Включено', value: true },
            { title: 'Выключено', value: false }
        ], true);
    }

    // 5. Старт
    function init() {
        $('body').append(style);
        
        // Слушаем открытие карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                renderBadges(e.object.activity.render(), e.data.movie);
            }
        });

        // Инъекция в настройки
        if (Lampa.SettingsApi) {
            Lampa.SettingsApi.addComponent({
                component: 'quality_plugin',
                name: 'Рейтинг и качество',
                value: true
            });
        }
        addSettings();
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') init();
        });
    }
})();
