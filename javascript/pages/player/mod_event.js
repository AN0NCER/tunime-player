export const Player = document.getElementById('player');

export const onPause$ = rxjs.fromEvent(Player, 'pause');
export const onPlay$ = rxjs.fromEvent(Player, 'play');
export const onDuration$ = rxjs.fromEvent(Player, 'durationchange');
export const onTimeUpdate$ = rxjs.fromEvent(Player, 'timeupdate');