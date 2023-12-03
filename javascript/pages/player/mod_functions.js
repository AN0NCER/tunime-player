import { Player, hls, onBuffered$, toggleFullScreen } from "../player.js";
import { onDuration$, onTimeUpdate$ } from "./mod_event.js";
import { AUTO_NEKST } from "./mod_ui.js";

let END_TIME = 0;
export const CURSOR_WIDTH = 33;

const onEndTime$ = new rxjs.Subject();

export function InitFunctions() {
    $('.l-controls > .switch-button').on('click', function () {
        if ($(this).hasClass('status-pause')) {
            Player.play();
        } else {
            Player.pause();
        }
    });

    $('.r-controls > .btn.pip').on('click', function () {
        togglePictureInPicture();
    });

    $('.r-controls > .btn.fs').on('click', function () {
        toggleFullScreen();
    });

    onDuration$.subscribe({
        next: () => {
            if (AUTO_NEKST && Player.duration) {
                //Сделать проверку если видео нету обрезки то поставить на 2%
                END_TIME = Player.duration - (2 / 100) * Player.duration;
                onEndTime$.next(END_TIME);

            }
        }
    });

    onTimeUpdate$.subscribe({
        next: () => {
            if (AUTO_NEKST && END_TIME != 0) {
                if (Player.currentTime >= END_TIME) {
                    console.log('endVideo');

                    Player.pause();
                    Player.src = '';
                    Player.load();

                    //Сделать переключение на следующий эпизод
                }
            }
        }
    });

    onBuffered$.subscribe({
        next: (time) => {
            if (AUTO_NEKST && END_TIME != 0) {
                if (time >= END_TIME) {
                    console.log('[plr] - Buffered stoped');
                    hls.stopLoad();
                }
            }
        }
    });

    CurrentPointScroll();
    TrimPointScroll();
}

onEndTime$.subscribe({
    next: (endtime) => {
        const slid = $('.player-slides > .trim-slid');
        const cursor = $('.player-cursors > .trim-cursor');
        let prcnt = ((Player.duration - endtime) / Player.duration) * 100;
        slid.width(`${prcnt}%`)
        cursor.css({ right: `calc(${prcnt}% - ${CURSOR_WIDTH / 2}px)` });
    }
})


function CurrentPointScroll() {
    const slid = $('.player-slides > .current-slid');
    const cursor = $('.player-cursors > .current-cursor');

    cursor.on('mousedown touchstart', function (e) {
        //Проверяем что видео прогрузилось и готово
        if (Player.duration == 0) return;
        //Координаты нажатия на cursor
        let startX = e.clientX || e.originalEvent.touches[0].clientX;
        let played = false;
        //Останавливаем плеер если вопсроизводиться
        if (!Player.paused) {
            Player.pause();
            played = true; //Запоминаем что плеер воспроизводился раньше
        }

        //Текущая длина slid
        let curWidth = slid.width();
        //Смещение курсора
        let cursorLeft = cursor.position().left;
        let event = true;

        $(window).on('mousemove.ev touchmove.ev', function (e) {
            //Координаты смещения
            let currentX = e.clientX || e.originalEvent.touches[0].clientX || e.originalEvent.clientX;
            let swipeDistance = currentX - startX;
            if ((slid.width() / 100) * 100 <= 0) {
                return;
            }
            cursor.css('left', cursorLeft + swipeDistance);
            slid.width(curWidth + swipeDistance);
            e.preventDefault();
        });

        $(window).on('mouseup.ev touchend.ev', function (e) {
            _endevent();
        });

        function _endevent() {
            if (event) {
                $(window).off('mousemove.ev touchmove.ev');
                $(window).off('mouseup.ev touchend.ev');
                event = false;
                let prcnt = (slid.width() / window.innerWidth) * 100;
                let currentTime = (prcnt / 100) * Player.duration;
                Player.currentTime = currentTime;
                slid.css({ width: `${prcnt}%` });
                cursor.css({ left: `calc(${prcnt}% - ${CURSOR_WIDTH / 2}px)` });
                hls.startLoad();
                if (played) Player.play();
            }
        }
    });
}

function TrimPointScroll() {
    const slid = $('.player-slides > .trim-slid');
    const cursor = $('.player-cursors > .trim-cursor');

    cursor.on('mousedown touchstart', function (e) {
        //Проверяем что видео прогрузилось и готово
        if (Player.duration == 0) return;
        //Координаты нажатия на cursor
        let startX = e.clientX || e.originalEvent.touches[0].clientX;
        let played = false;
        //Останавливаем плеер если вопсроизводиться
        if (!Player.paused) {
            Player.pause();
            played = true; //Запоминаем что плеер воспроизводился раньше
        }

        //Текущая длина slid
        let curWidth = slid.width();
        //Смещение курсора
        let cursorLeft = cursor.position().left;
        let event = true;

        $(window).on('mousemove.ev touchmove.ev', function (e) {
            //Координаты смещения
            let currentX = e.clientX || e.originalEvent.touches[0].clientX || e.originalEvent.clientX;
            let swipeDistance = currentX - startX;
            let width = curWidth + -swipeDistance;
            if ((window.innerWidth - $('.player-slides > .current-slid').width()) <= width) {
                _endevent();
                return;
            }
            console.log();
            cursor.css('right', (window.innerWidth - cursorLeft) - swipeDistance);
            cursor.css({ right: `calc(${(window.innerWidth - cursorLeft) - swipeDistance - (CURSOR_WIDTH / 2)}px - ${CURSOR_WIDTH / 2}px)` });
            slid.width((curWidth + -swipeDistance));
            e.preventDefault();
        });

        $(window).on('mouseup.ev touchend.ev', function (e) {
            _endevent();
        });

        function _endevent() {
            if (event) {
                $(window).off('mousemove.ev touchmove.ev');
                $(window).off('mouseup.ev touchend.ev');
                event = false;
                let prcnt = (slid.width() / window.innerWidth) * 100;
                let timeTrim = (prcnt / 100) * Player.duration;
                END_TIME = Player.duration - timeTrim;
                slid.css({ width: `${prcnt}%` });
                cursor.css({ right: `calc(${prcnt}% - ${CURSOR_WIDTH / 2}px)` });
                if (played) Player.play();
            }
        }
    });
}

function togglePictureInPicture() {
    if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
    } else if (document.pictureInPictureEnabled) {
        Player.requestPictureInPicture();
    }
}