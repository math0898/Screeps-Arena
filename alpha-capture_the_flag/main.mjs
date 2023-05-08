import { ATTACK, HEAL, RANGED_ATTACK } from "game/constants";
import { Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

var melee = [];
var ranged = [];
var healer = [];

var firstTick = function () {
    melee = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == ATTACK));
    ranged = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == RANGED_ATTACK));
    healer = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == HEAL));
    firstTick = () => {};
}

export function loop () {
    
    firstTick();
}
