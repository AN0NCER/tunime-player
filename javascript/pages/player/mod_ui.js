import { onBuffered$ } from "../player.js";
import { AnimButtonStatus } from "./mod_animation.js";
import { Player, onDuration$, onPause$, onPlay$, onTimeUpdate$ } from "./mod_event.js";

const AUTO_NEKST = true;

export function InitUI() {
    if (!AUTO_NEKST) {
        $('.trim-slid').hide();
    }

    $('.l-controls > .switch-button').on('click', function () {
        if ($(this).hasClass('status-pause')) {
            Player.play();
        } else {
            Player.pause();
        }
    });

    onBuffered$.subscribe({
        next: (time) => {
            const prcnt = calculatePercentageWatched(Player.duration, time);
            $('.loaded-slid').css({ width: `${prcnt}%` })
        }
    });

    ToggleWindowEvent();
    ToggleControlsEvent();
}

function ToggleWindowEvent() {
    $(window).on('mouseenter click mousemove mouseleave touchstart', function () {
        HideControls();
    });
}

let timerHideControls;
function HideControls() {
    $('.controls-wrapper').removeClass('hide');
    clearTimeout(timerHideControls);
    timerHideControls = setTimeout(() => {
        if (Player.paused) return;
        $('.controls-wrapper').addClass('hide');
    }, 5000)
}

function ToggleControlsEvent() {
    let target = $('.player-controls');
    target.on('click mouseenter mouseleave touchleave', function (e) {
        HideCursors();
     });
}

let timerHideCursors;
function HideCursors() {
    $('.current-cursor').removeClass('hide');
    clearTimeout(timerHideCursors);
    timerHideCursors = setTimeout(() => {
        $('.current-cursor').addClass('hide');
    }, 3000);
}

onTimeUpdate$.subscribe({
    next: () => {
        let time = secondsToTime(Player.currentTime);
        let texttime = genTextTime(time);
        $('.player-time > .current-time').text(texttime);
    }
})

onTimeUpdate$.subscribe({
    next: () => {
        const prcnt = calculatePercentageWatched(Player.duration, Player.currentTime);
        $('.player-slides > .current-slid').css({ width: `${prcnt}%` });
        $('.player-cursors > .current-cursor').css({ left: `calc(${prcnt}% - 6.5px)` });
    }
})

onDuration$.subscribe({
    next: () => {
        let time = secondsToTime(Player.duration);
        let texttime = genTextTime(time);
        $('.player-time > .durration').text(texttime);
    }
})

onPause$.subscribe({
    next: () => {
        AnimButtonStatus.pause();
        $('.l-controls > .switch-button').addClass('status-pause');
    }
});

onPlay$.subscribe({
    next: () => {
        AnimButtonStatus.play();
        $('.l-controls > .switch-button').removeClass('status-pause');
    }
});

function calculatePercentageWatched(videoDuration, currentTime) {
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