import { InitUI, InitUICallbacks } from "./player/mod_ui.js";
import { InitEvent } from "./player/mod_event.js";
import { InitFunctions } from "./player/mod_functions.js";

export const Player = document.getElementById('player');

const FULL_PLAYER = true;

// import { AnimButtonStatus, AnimLoadPlayer } from "./player/mod_animation.js";
// import { LoadM3U8 } from "./player/mod_stream.js";
// import {} from './player/mod_usercontrol.js';

// export const AnimeQuery = { id: new URLSearchParams(window.location.search).get("id"), episode: new URLSearchParams(window.location.search).get("e") };

// export const onCanPlay$ = rxjs.fromEvent(Player, 'loadstart');

// export const toggleFullScreen = async () => {
//     const container = document.getElementById('player-wrapper');
//     const fullscreenApi = container.requestFullscreen
//         || container.webkitRequestFullScreen
//         || container.mozRequestFullScreen
//         || container.msRequestFullscreen;

//     if (fullscreenApi == undefined) {
//         if (VideoPlayer.webkitEnterFullscreen) {
//             VideoPlayer.webkitEnterFullscreen();
//         } else if (VideoPlayer.requestFullscreen) {
//             VideoPlayer.requestFullscreen();
//         }
//     }
//     if (!document.fullscreenElement) {
//         fullscreenApi.call(container);
//     }
//     else {
//         document.exitFullscreen();
//     }
// };

// let _HLS = undefined;

// const ParentWindow = window.parent; // Данные с iframe

// (async () => {
//     //Анимация загрузки плеера
//     AnimLoadPlayer.start();
//     //Проверяем на пришедшие данные аниме
//     if (!AnimeQuery.id || !AnimeQuery.episode) return;

//     let stream_file = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

//     if (!(ParentWindow.location.pathname == "/watch.html" && ParentWindow.location.hostname == window.location.hostname)) {
//         stream_file = await LoadM3U8(AnimeQuery.id, AnimeQuery.episode);
//     }

//     SelectPlayer(stream_file);
// })();

// const onReady$ = new rxjs.Subject();
// onReady$.subscribe({
//     next: () => {
//         AnimLoadPlayer.stop();
//     }
// });

// //Функция выбора метод воспроизведения видео
// function SelectPlayer(stream_file) {
//     if (Hls.isSupported()) {
//         if (!_HLS) {
//             _HLS = new Hls();
//             //Подписаться на события библиотеки hls.js
//             onHLS(_HLS);
//         }
//         _HLS.loadSource(stream_file);
//         _HLS.attachMedia(Player);
//     } else {
//         console.log('[PTunime] - HLS Disabled');
//         let s = onCanPlay$.subscribe({
//             next: () => {
//                 onReady$.next(true);
//                 s.unsubscribe();
//             }
//         })
//         Player.src = stream_file;
//     }

// }

// //События библиотеки hls.js
// function onHLS(hls) {
//     hls.on(Hls.Events.ERROR, (e, data) => {
//         if (data.fatal) {
//             //Критическая ошибка
//         }
//     });
//     hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         //Манифест прочитан можно отображать плеер
//         onReady$.next(true);
//     })
// }


export const hls = new Hls();

export const onBuffered$ = new rxjs.Subject();
(async () => {
    InitEvent();
    InitUI();
    InitUICallbacks();
    InitFunctions();
})();

if (Hls.isSupported()) {
    hls.loadSource("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8");
    hls.attachMedia(Player);
    hls.on(Hls.Events.BUFFER_APPENDED, function (event, data) {
        var bufferedRanges = Player.buffered;

        if (bufferedRanges.length > 0) {
            var loadedTime = bufferedRanges.end(bufferedRanges.length - 1);
            onBuffered$.next(loadedTime);
        }
    });
} else {
    Player.src = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
    Player.addEventListener('timeupdate', function () {
        var bufferedRanges = Player.buffered;
        if (bufferedRanges.length > 0) {
            var loadedTime = bufferedRanges.end(bufferedRanges.length - 1);
            onBuffered$.next(loadedTime);
        }
    })
}