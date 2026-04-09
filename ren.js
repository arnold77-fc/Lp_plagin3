(function () {
    'use strict';

    // Константы из вашего файла
    var OMDB_API_KEYS = ['73ff4450'];
    var KP_API_KEYS = ['5178ab83-699c-4422-937e-f8a759f872ef'];

    // 1. Создаем компонент настроек (само окно)
    function RatingsSettings(object) {
        var comp = new Lampa.InteractionMain(object);

        comp.create = function () {
            this.activity.loader(false);
            this.render().find('.interaction-main__body').append(this.build());
        };

        comp.build = function () {
            var _this = this;
            var items = [
                {
                    title: 'Средний рейтинг',
                    descr: 'Показывать вычисленный средний балл на основе всех сервисов',
                    type: 'bool',
                    name: 'ratings_show_avg',
                    value: true
                },
                {
                    title: 'Рейтинг Кинопоиск',
                    descr: 'Отображать оценку с Кинопоиска',
                    type: 'bool',
                    name: 'ratings_show_kp',
                    value: true
                },
                {
                    title: 'Ключ Кинопоиск',
                    descr: 'Ваш личный токен (по умолчанию встроенный)',
                    type: 'input',
                    name: 'ratings_kp_key',
                    placeholder: 'Введите токен'
                }
            ];

            var list = $('<div class="settings-list"></div>');

            items.forEach(function (item) {
                var field = Lampa.Template.get('settings_field', item);
                
                if (item.type === 'bool') {
                    var sw = Lampa.Template.get('settings_field_checkbox', {
                        name: item.name,
                        value: Lampa.Storage.get(item.name, item.value)
                    });
                    field.append(sw);
                }

                field.on('hover:enter', function () {
                    if (item.type === 'bool') {
                        var val = !Lampa.Storage.get(item.name, item.value);
                        Lampa.Storage.set(item.name, val);
                        field.find('.settings-param__checkbox').toggleClass('active', val);
                    } else if (item.type === 'input') {
                        Lampa.Input.edit({
                            value: Lampa.Storage.get(item.name, ''),
                            free: true
                        }, function (new_val) {
                            Lampa.Storage.set(item.name, new_val);
                            Lampa.Noty.show('Сохранено');
                        });
                    }
                });

                list.append(field);
            });

            return list;
        };

        return comp;
    }

    // 2. Регистрация в меню и системе
    function init() {
        // Регистрируем компонент в системе Lampa
        Lampa.Component.add('ratings_gold_settings', RatingsSettings);

        // Добавляем пункт в Настройки
        Lampa.SettingsApi.addPart({
            component: 'ratings_gold_settings',
            name: 'ratings_gold_part',
            tab: true, // Важно для Android версии
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>',
            title: 'Рейтинг и качество',
            descr: 'Настройка внешних рейтингов и меток качества'
        });

        // Логика отображения в карточке
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;
            var render = e.object.activity.render();
            if (Lampa.Storage.get('ratings_show_avg', true)) {
                var val = e.data.movie.vote_average || '0.0';
                var html = $('<div class="applecation__ratings show" style="display:flex; margin-top:10px; font-size:1.4em; font-weight:bold; color:#FFDF6D;">★ ' + val + '</div>');
                render.find('.full-start__details').after(html);
            }
        });
    }

    // Запуск плагина
    if (window.appready) init();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') init(); });

})();
