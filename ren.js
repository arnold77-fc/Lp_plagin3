(function () {
    'use strict';

    // 1. СТИЛИ (улучшенные, из вашего кода)
    var styleBlock = `
        <style>
            .flix-quality-line { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; align-items: center; pointer-events: none; }
            .flix-item { padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.1); color: #fff; font-size: 13px; font-weight: bold; }
            .flix-res-4k { background: #e50914 !important; }
            .flix-res-fhd { background: #00897b !important; }
            .flix-ua { background: #0057b7 !important; border: 1px solid #ffd700; color: #ffd700 !important; }
            .flix-rating-kp { color: #ff5c00; font-size: 16px; font-weight: bold; margin-left: 5px; }
        </style>
    `;

    // 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
    function getQuality(title) {
        var t = (title || '').toLowerCase();
        if (t.indexOf('4k') > -1 || t.indexOf('2160') > -1) return '4K';
        if (t.indexOf('1080') > -1 || t.indexOf('fhd') > -1) return 'FHD';
        return '';
    }

    // 3. ОСНОВНАЯ ЛОГИКА ОТРИСОВКИ
    function injectRatings(render, movie) {
        if (render.find('.flix-quality-line').length) return;

        var target = render.find('.full-start-new__rate-line, .full-start__rate').first();
        if (!target.length) return;

        var container = $('<div class="flix-quality-line"></div>');
        var quality = getQuality(movie.title || movie.name);
        
        if (quality) {
            var cls = quality === '4K' ? 'flix-res-4k' : 'flix-res-fhd';
            container.append('<div class="flix-item ' + cls + '">' + quality + '</div>');
        }

        if (/(ukr|укр|ua|uk)/i.test(movie.title || movie.name)) {
            container.append('<div class="flix-item flix-ua">UA</div>');
        }

        target.after(container);

        // Запрос рейтинга KP (Ваш ключ)
        var kp_key = '2ed29580-9942-45fd-96d5-6b3a3297b69c';
        var year = (movie.release_date || movie.first_air_date || '').split('-')[0];
        var url = 'https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=' + encodeURIComponent(movie.title || movie.name);

        $.ajax({
            url: url,
            headers: { 'X-API-KEY': kp_key },
            success: function(data) {
                var found = data.films ? data.films.find(f => f.year == year) : null;
                if (found && found.rating && found.rating !== 'null') {
                    container.append('<div class="flix-rating-kp">КП: ' + found.rating + '</div>');
                }
            }
        });
    }

    // 4. РЕГИСТРАЦИЯ КОМПОНЕНТА И НАСТРОЕК
    function start() {
        $('body').append(styleBlock);

        // Добавляем обработчик карточки
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                injectRatings(e.object.activity.render(), e.data.movie);
            }
        });

        // Создаем сам пункт настроек (чтобы не был пустым)
        Lampa.SettingsApi.addComponent({
            component: 'quality_rating',
            name: 'Рейтинг и качество',
            value: true
        });

        // Описываем, что будет внутри пункта настроек
        Lampa.Settings.listener.follow('open', function (e) {
            if (e.name === 'quality_rating') {
                var folder = e.body; // Это контейнер настроек
                
                // Добавляем текст или переключатели внутрь, чтобы не было пусто
                var item = $(`<div class="settings-param selector">
                    <div class="settings-param__name">Статус плагина</div>
                    <div class="settings-param__value">Активен</div>
                    <div class="settings-param__descr">Отображает качество (4K/FHD) и рейтинг Кинопоиска в карточке фильма.</div>
                </div>`);

                folder.append(item);
                
                // Чтобы пункт можно было выбрать/нажать (для красоты)
                item.on('hover:enter', function() {
                    Lampa.Noty.show('Плагин работает автоматически');
                });
                
                Lampa.Controller.add('settings_quality', {
                    toggle: function() {
                        Lampa.Controller.collectionSet(folder);
                        Lampa.Controller.navigate();
                    },
                    back: function() {
                        Lampa.Settings.main();
                    }
                });
                Lampa.Controller.toggle('settings_quality');
            }
        });
    }

    // Запуск
    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
