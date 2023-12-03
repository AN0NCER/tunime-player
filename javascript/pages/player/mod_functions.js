import { Player, hls, onBuffered$ } from "../player.js";
import { onDuration$, onTimeUpdate$ } from "./mod_event.js";
import { AUTO_NEKST } from "./mod_ui.js";

let END_TIME = 0;

const onEndTime$ = new rxjs.Subject();

export function InitFunctions() {
    $('.l-controls > .switch-button').on('click', function () {
        if ($(this).hasClass('status-pause')) {
            Player.play();
        } else {
            Player.pause();
        }
    });

    onDuration$.subscribe({
        next: () => {
            if (AUTO_NEKST && Player.duration) {
                //Сделать проверку если видео нету обрезки то поставить на 2%
                END_TIME = Player.duration - (99 / 100) * Player.duration;
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
                console.log(time, Player.duration, END_TIME);
                if (time >= END_TIME) {
                    console.log('STOPLOAD');
                    hls.stopLoad();
                }
            }
        }
    });

    CurrentPointScroll();
}

onEndTime$.subscribe({
    next: (endtime) => {
        const slid = $('.player-slides > .trim-slid');
        const cursor = $('.player-cursors > .trim-cursor');
        let prcnt = ((Player.duration - endtime) / Player.duration) * 100;
        slid.width(`${prcnt}%`)
        cursor.css({ right: `calc(${prcnt}% - 6.5px)` });
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
                if (played) Player.play();
            }
        }
    });
}