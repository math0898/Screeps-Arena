import { ATTACK, HEAL, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";
import { getObjectsByPrototype, getTicks } from "game/utils";
import { Squad } from "./Squad.mjs";

var melee = [];
var ranged = [];
var healer = [];
var squads = [];

var firstTick = function () {
    melee = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == ATTACK));
    ranged = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == RANGED_ATTACK));
    healer = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == HEAL));
    squads.push(new Squad(healer.pop(), healer.pop(), ranged.pop(), ranged.pop()));
    squads.push(new Squad(healer.pop(), healer.pop(), ranged.pop(), ranged.pop()));
    firstTick = () => {};
}

export function loop () {
    firstTick();
    if (getTicks() < 10) {
        squads[0].moveTo({x: 50, y: 7}, false);
        squads[1].moveTo({x: 12, y: 19}, false);
    } else {
        squads[0].moveTo({x: 50, y: 7});
        squads[1].moveTo({x: 12, y: 19});
    }
}
