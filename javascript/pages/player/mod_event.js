import { Player } from "../player.js";

export let onPause$, onPlay$, onDuration$, onTimeUpdate$ = undefined;

export function InitEvent() {
    onPause$ = rxjs.fromEvent(Player, 'pause');
    onPlay$ = rxjs.fromEvent(Player, 'play');
    onDuration$ = rxjs.fromEvent(Player, 'durationchange');
    onTimeUpdate$ = rxjs.fromEvent(Player, 'timeupdate');
}
