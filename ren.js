(function () {
    'use strict';

    // 1. Константы и API ключи из файла
    var OMDB_API_KEYS = ['73ff4450'];
    var KP_API_KEYS = ['5178ab83-699c-4422-937e-f8a759f872ef'];
    var WEIGHTS = { imdb: 0.35, tmdb: 0.15, kp: 0.20, mc: 0.15, rt: 0.15 };

    // 2. SVG Иконка для меню
    var icon_star = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="currentColor"/></svg>';

    // 3. Функция создания настроек
    function setupSettings() {
        // Добавляем новый пункт в главный список настроек
        Lampa.Settings.add({
            title: 'Рейтинг и качество',
            type: 'book',
            icon: icon_star,
            name: 'maxsm_ratings_settings'
        });

        // Создаем содержимое этого пункта
        Lampa.Settings.bind('maxsm_ratings_settings', function (item) {
            item.append(Lampa.Template.get('settings_list_top', {
                title: 'Настройки рейтингов',
                descr: 'Управление отображением оценок и качества контента'
            }));

            // Переключатель отображения среднего рейтинга
            var show_avg = Lampa.Template.get('settings_field', {
                name: 'ratings_show_avg',
                title: 'Средний рейтинг',
                descr: 'Показывать вычисленный средний балл'
            });
            show_avg.append(Lampa.Template.get('settings_field_checkbox', { name: 'ratings_show_avg', value: true }));
            item.append(show_avg);

            // Переключатель рейтинга Кинопоиска
            var show_kp = Lampa.Template.get('settings_field', {
                name: 'ratings_show_kp',
                title: 'Рейтинг Кинопоиск',
                descr: 'Отображать данные из KP API'
            });
            show_kp.append(Lampa.Template.get('settings_field_checkbox', { name: 'ratings_show_kp', value: true }));
            item.append(show_kp);

            // Поле для ключа API (если пользователь захочет свой)
            var kp_key = Lampa.Template.get('settings_field', {
                name: 'ratings_kp_key',
                title: 'Ключ Кинопоиск (опционально)',
                descr: 'Ваш личный токен для API Кинопоиска'
            });
            kp_key.append('<div class="settings-param__value">Изменить</div>');
            kp_key.on('hover:enter', function() {
                Lampa.Input.edit({
                    value: Lampa.Storage.get('ratings_kp_key', ''),
                    free: true
                }, function(new_value) {
                    Lampa.Storage.set('ratings_kp_key', new_value);
                    Lampa.Noty.show('Сохранено');
                });
            });
            item.append(kp_key);
        });
    }

    // 4. Логика отображения в карточке
    function initRatingsInCard() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            
            var render = e.object.activity.render();
            var ratingsCont = $('<div class="applecation__ratings show"></div>');
            
            // Если включено в настройках — показываем
            if (Lampa.Storage.field('ratings_show_avg')) {
                var val = e.data.movie.vote_average || '0.0';
                ratingsCont.append('<div class="rating-item" style="color:#FFDF6D; font-weight:bold; margin-right:15px;">★ '+val+'</div>');
            }
            
            render.find('.full-start__details').after(ratingsCont);
        });
    }

    // 5. Запуск
    function startPlugin() {
        if (window.ratings_plugin_loaded) return;
        window.ratings_plugin_loaded = true;

        setupSettings();
        initRatingsInCard();
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });

})();
