import { Player, onBuffered$ } from "../player.js";
import { AnimButtonStatus, AnimSettings } from "./mod_animation.js";
import { onDuration$, onPause$, onPlay$, onTimeUpdate$ } from "./mod_event.js";
import { CURSOR_WIDTH } from "./mod_functions.js";

export const AUTO_NEKST = true;
const STANDART_CONTROLS = false;

export function InitUI() {
    $('.l-controls > .volume').on('click', function () {
        if ($('.volume-slider').hasClass('hide')) {
            $('.volume-slider').removeClass('hide');
        } else {
            $('.volume-slider').addClass('hide');
        }
    });

    $('.r-controls > .btn.settings').on('click', function () {
        if ($(this).hasClass('showed')) {
            AnimSettings.hide();
            $(this).removeClass('showed')
        } else {
            AnimSettings.show();
            $(this).addClass('showed')
        }
    });

    SubscribePlayerControlsEvent();
    SubscribeCurrentCursorsEvents();
    SubscribeTrimCursorEvents();
}

export function InitUICallbacks() {
    onPause$.subscribe({
        //переключение switch button на статус паузы
        next: () => {
            AnimButtonStatus.pause();
            $('.l-controls > .switch-button').addClass('status-pause');
            subCurrentCursor$.next(true);
            subTrimCursor$.next(true);
        }
    });
    onPlay$.subscribe({
        //переключение switch button на статус воспроизведение
        next: () => {
            AnimButtonStatus.play();
            $('.l-controls > .switch-button').removeClass('status-pause');
        }
    });
    onBuffered$.subscribe({
        next: (time) => {
            const prcnt = calculatePercentageWatched(Player.duration, time);
            $('.loaded-slid').css({ width: `${prcnt}%` })
        }
    });
    onTimeUpdate$.subscribe({
        next: () => {
            let time = secondsToTime(Player.currentTime);
            let texttime = genTextTime(time);
            $('.player-time > .current-time').text(texttime);
        }
    });
    onTimeUpdate$.subscribe({
        next: () => {
            const prcnt = calculatePercentageWatched(Player.duration, Player.currentTime);
            $('.player-slides > .current-slid').css({ width: `${prcnt}%` });
            $('.player-cursors > .current-cursor').css({ left: `calc(${prcnt}% - ${CURSOR_WIDTH / 2}px)` });
        }
    });
    onDuration$.subscribe({
        next: () => {
            let time = secondsToTime(Player.duration);
            let texttime = genTextTime(time);
            $('.player-time > .durration').text(texttime);
        }
    });
}

const subControls$ = new rxjs.Subject();

let inWindow = false;
let inControls = false;

function SubscribePlayerControlsEvent() {
    const controls = $('.player-controls');
    controls.on('mouseenter', function () {
        inControls = true;
        subControls$.next(inControls);
        subCurrentCursor$.next(true);
        subTrimCursor$.next(true);
    });
    controls.on('mousemove', function () {
        subCurrentCursor$.next(true);
        subTrimCursor$.next(true);
    });
    controls.on('mouseleave', function () {
        inControls = false;
        subControls$.next(inControls);
    })
    $('#player-wrapper').on('mouseleave', function () {
        inWindow = false;
        subControls$.next(inWindow);
    });
    $('#player-wrapper').on('mouseenter', function () {
        inWindow = true;
        subControls$.next(inWindow);
    });
    $('#player-wrapper').on('mousemove', function () {
        inWindow = true;
        subControls$.next(inWindow);
    });
    Player.addEventListener('click', function () {
        subControls$.next();
        if (Player.paused) {
            Player.play();
        } else {
            Player.pause();
        }
    });
}

subControls$.subscribe({
    next: () => {
        if (Player.paused) {
            //Всегда отображаем
            $('.controls-wrapper').removeClass('hide');
            $('.player-wrapper').removeClass('hide');
            clearTimeout(timerHideControls);
            return;
        }
        if (inWindow) {
            if (!inControls) {
                //Запустить таймер бездействия
                HideControls();
            }
        } else {
            //Скрыть елементы управления
            HideControls(2000);
        }
    }
});

//Таймер бездействия сокрытия панель управлением
let timerHideControls;

//Скрытие панель управлением
function HideControls(time = 5000) {
    $('.player-wrapper').removeClass('hide');
    $('.controls-wrapper').removeClass('hide');
    clearTimeout(timerHideControls);
    timerHideControls = setTimeout(() => {
        $('.controls-wrapper').addClass('hide');
        $('.player-wrapper').addClass('hide');
    }, time);
}

const subCurrentCursor$ = new rxjs.Subject();

function SubscribeCurrentCursorsEvents() {
    $('.player-cursors > .current-cursor').on('touchstart mouseenter', function () {
        clearTimeout(timerHideCurrentCursors);
        clearTimeout(timerHideControls);

        clearTimeout(timerHideCurrentCursors);
        $('.player-cursors > .trim-cursor').addClass('hide');
    });
    $('.player-cursors > .current-cursor').on('touchend mouseleave', function () {
        subCurrentCursor$.next(true);
        subControls$.next(true);
    })
}

subCurrentCursor$.subscribe({
    next: () => {
        HideCurerentCursor();
    }
});

//Таймер бездействия курсора
let timerHideCurrentCursors;

//Скрытие курсора по бездействию
function HideCurerentCursor() {
    $('.player-cursors > .current-cursor').removeClass('hide');
    clearTimeout(timerHideCurrentCursors);
    timerHideCurrentCursors = setTimeout(() => {
        $('.player-cursors > .current-cursor').addClass('hide');
    }, 3000);
}

const subTrimCursor$ = new rxjs.Subject();

function SubscribeTrimCursorEvents() {
    $('.player-cursors > .trim-cursor').on('touchstart mouseenter', function () {
        clearTimeout(timerHideTrimCursor);
        clearTimeout(timerHideControls);

        clearTimeout(timerHideCurrentCursors);
        $('.player-cursors > .current-cursor').addClass('hide');
    });
    $('.player-cursors > .trim-cursor').on('touchend mouseleave', function () {
        subTrimCursor$.next(true);
        subControls$.next(true);
    })
}

subTrimCursor$.subscribe({
    next: () => {
        if (!AUTO_NEKST) return;
        HideTrimCursor();
    }
});

let timerHideTrimCursor;

function HideTrimCursor() {
    $('.player-cursors > .trim-cursor').removeClass('hide');
    clearTimeout(timerHideTrimCursor);
    timerHideTrimCursor = setTimeout(() => {
        $('.player-cursors > .trim-cursor').addClass('hide');
    }, 3000);
}

export function calculatePercentageWatched(videoDuration, currentTime) {
    if (currentTime > videoDuration) {
        currentTime = videoDuration;
    }

    const percentageWatched = (currentTime / videoDuration) * 100;
    return percentageWatched;
}

function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const timeObject = {
        hours: hours,
        minutes: minutes,
        seconds: remainingSeconds
    };

    return timeObject;
}

function genTextTime(time = { hours: 0, minutes: 0, seconds: 0 }) {
    let text = `${time.minutes}:${time.seconds}`;
    if (time.hours != 0) {
        text = `${time.hours}:${text}`;
    }
    return text;
}