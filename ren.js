(function () {
    'use strict';

    // 1. Инициализация параметров в хранилище (чтобы не были пустые)
    if (Lampa.Storage.get('ratings_show_avg') === null) Lampa.Storage.set('ratings_show_avg', true);
    if (Lampa.Storage.get('ratings_show_kp') === null) Lampa.Storage.set('ratings_show_kp', true);

    // 2. Компонент окна настроек
    function RatingsSettings(object) {
        var comp = new Lampa.InteractionMain(object);
        
        comp.create = function () {
            this.activity.loader(false);
            this.render().find('.interaction-main__body').append(this.build());
        };

        comp.build = function () {
            var list = $('<div class="settings-list"></div>');
            var items = [
                { title: 'Средний рейтинг', name: 'ratings_show_avg' },
                { title: 'Рейтинг Кинопоиск', name: 'ratings_show_kp' }
            ];

            items.forEach(function (item) {
                var field = Lampa.Template.get('settings_field', {
                    title: item.title,
                    descr: 'Включить или выключить отображение'
                });
                var checkbox = Lampa.Template.get('settings_field_checkbox', {
                    name: item.name,
                    value: Lampa.Storage.get(item.name)
                });

                field.append(checkbox);
                field.on('hover:enter', function () {
                    var status = !Lampa.Storage.get(item.name);
                    Lampa.Storage.set(item.name, status);
                    checkbox.toggleClass('active', status);
                });
                list.append(field);
            });

            return list;
        };
        return comp;
    }

    // 3. Регистрация пункта меню
    function addSettingsMenu() {
        // Регистрируем компонент в системе
        Lampa.Component.add('ratings_gold', RatingsSettings);

        // Добавляем в SettingsApi (для новых версий)
        Lampa.SettingsApi.addPart({
            component: 'ratings_gold',
            name: 'ratings_gold_part',
            tab: true,
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            title: 'Рейтинг и качество',
            descr: 'Настройка внешних рейтингов'
        });

        // ПРИНУДИТЕЛЬНАЯ ИНЪЕКЦИЯ (для Android 1.12.4)
        // Слушаем открытие главного меню настроек
        Lampa.Listener.follow('settings', function (e) {
            if (e.type === 'open' && e.name === 'main') {
                var item = $('<div class="settings-folder selector" data-component="ratings_gold">' +
                    '<div class="settings-folder__icon">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>' +
                    '</div>' +
                    '<div class="settings-folder__content">' +
                        '<div class="settings-folder__title">Рейтинг и качество</div>' +
                        '<div class="settings-folder__descr">Настройка отображения оценок</div>' +
                    '</div>' +
                '</div>');

                item.on('hover:enter', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: 'Рейтинг и качество',
                        component: 'ratings_gold',
                        page: 1
                    });
                });

                e.body.append(item);
            }
        });
    }

    // 4. Логика отображения в карточке фильма
    function initCardLogic() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            if (!Lampa.Storage.get('ratings_show_avg')) return;

            var render = e.object.activity.render();
            var val = e.data.movie.vote_average || '0.0';
            
            var html = $('<div class="applecation__ratings show" style="display:flex; margin: 15px 0; font-size:1.5em; font-weight:bold; color:#FFDF6D; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; width: fit-content;">★ ' + val + '</div>');
            
            // Вставляем после описания или деталей
            render.find('.full-start__details').after(html);
        });
    }

    // Запуск
    function start() {
        addSettingsMenu();
        initCardLogic();
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') start(); });

})();
