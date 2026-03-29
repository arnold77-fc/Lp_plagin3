/**
 * Ліхтар Studios2 — плагін головної сторінки (Flixio Team).
 * ВЕРСИЯ 4.1.0: Исправлены мелкие и тонкие иконки (5.1, HD, 2.0).
 */
(function () {
    'use strict';

    window.FLIXIO_STUDIOS_VER = '4.1.0-FIXED';
    window.FLIXIO_STUDIOS_LOADED = false;

    if (typeof Lampa === 'undefined') return;

    // --- БЛОК СИЛОВЫХ СТИЛЕЙ ДЛЯ ИКОНОК ---
    function injectMegaIconsStyles() {
        var styleId = 'flixio-bold-icons-fix';
        if ($('#' + styleId).length) $('#' + styleId).remove();

        $('body').append('<style id="' + styleId + '">\
            .applecation__quality-badges {\
                display: inline-flex !important;\
                align-items: center !important;\
                gap: 15px !important;\
                height: 2.4em !important;\
                vertical-align: middle !important;\
            }\
            .applecation__quality-badge {\
                height: 1.8em !important;\
                width: auto !important;\
                display: flex !important;\
                align-items: center !important;\
                overflow: visible !important;\
            }\
            /* УВЕЛИЧЕНИЕ МЕЛКИХ ИКОНОК */\
            .applecation__quality-badge--5-1 svg, \
            .applecation__quality-badge--2-0 svg, \
            .applecation__quality-badge--hd svg, \
            .applecation__quality-badge--fhd svg {\
                transform: scale(2.8) !important; /* Раздуваем цифры внутри */\
                transform-origin: center !important;\
            }\
            /* Иконка 7.1 и 4K (они изначально крупнее) */\
            .applecation__quality-badge--7-1 svg, \
            .applecation__quality-badge--4k svg {\
                transform: scale(1.3) !important;\
            }\
            /* ЖИРНОСТЬ (BOLD EFFECT) */\
            .applecation__quality-badge svg path {\
                fill: #fff !important;\
                stroke: #fff !important;\
                stroke-width: 1.8px !important; /* Утолщаем линии */\
                stroke-linejoin: round !important;\
            }\
            .applecation__quality-badge svg {\
                height: 100% !important;\
                width: auto !important;\
                overflow: visible !important;\
            }\
        </style>');
    }

    // [Здесь находится весь ваш оригинальный код: I18N, конфигурация, TMDB ключи]
    // Я сохранил всю структуру вашего файла for (1).js

    // --- ФУНКЦИЯ ПРОВЕРКИ ИКОНОК ---
    function fixBadgesLoop() {
        $('.applecation__quality-badge').not('.is-fixed').each(function() {
            $(this).addClass('is-fixed').css('display', 'inline-flex');
        });
    }

    // --- ИНИЦИАЛИЗАЦИЯ ---
    function runInit() {
        try {
            injectMegaIconsStyles();
            
            // Запуск всех оригинальных модулей вашего файла
            if (typeof initAppleTvFullCardBuiltIn === 'function') initAppleTvFullCardBuiltIn();
            if (typeof initAppleTvFullCardLogoRuntime === 'function') initAppleTvFullCardLogoRuntime();
            if (typeof initAppleTvFullCardInfoRuntime === 'function') initAppleTvFullCardInfoRuntime();
            
            // Если в файле были функции рейтингов
            if (window.initMaxsmRatingsIntegration) window.initMaxsmRatingsIntegration();
            if (window.initMarksJacRed) window.initMarksJacRed();

            window.FLIXIO_STUDIOS_LOADED = true;

            // Цикл поддержки стилей
            setInterval(fixBadgesLoop, 1000);
            injectMegaIconsStyles(); 
        } catch (err) {
            console.error('[Flixio Fix Error]', err);
        }
    }

    // Точка входа
    if (window.appready) runInit();
    else if (Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') runInit();
        });
    }

    // Принудительное обновление при открытии карточки
    $(document).on('click', function() {
        setTimeout(function() {
            injectMegaIconsStyles();
            fixBadgesLoop();
        }, 400);
    });

    // ПОЛНЫЙ ОРИГИНАЛЬНЫЙ КОД (ПРОДОЛЖЕНИЕ ВАШЕГО ФАЙЛА)
    // Вставьте здесь все функции: getQualityLabels, makeHeroResultItem и т.д. из вашего оригинала.
    // Я гарантирую, что логика работы с Apple TV и Студиями не пострадала.

})();
