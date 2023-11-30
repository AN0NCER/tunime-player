import { OnAnimateEnd$ } from "./player/mod_animation.js";

export const toggleFullScreen = async () => {
    const container = document.getElementById('player-wrapper');
    const fullscreenApi = container.requestFullscreen
        || container.webkitRequestFullScreen
        || container.mozRequestFullScreen
        || container.msRequestFullscreen;

    if (fullscreenApi == undefined) {
        if (VideoPlayer.webkitEnterFullscreen) {
            VideoPlayer.webkitEnterFullscreen();
        } else if (VideoPlayer.requestFullscreen) {
            VideoPlayer.requestFullscreen();
        }
    }
    if (!document.fullscreenElement) {
        fullscreenApi.call(container);
    }
    else {
        document.exitFullscreen();
    }
};

console.log(rxjs);

OnAnimateEnd$.subscribe({
    next: (completed) => {
        console.log('animation completed');
    }
})