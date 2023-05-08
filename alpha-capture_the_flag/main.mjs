import { ATTACK, HEAL, RANGED_ATTACK, TERRAIN_PLAIN, TERRAIN_SWAMP, TERRAIN_WALL } from "game/constants";
import { Creep } from "game/prototypes";
import { getObjects, getTerrainAt } from "game/utils";
import { CostMatrix } from "game/path-finder";
import { getObjectsByPrototype, getTicks } from "game/utils";
import { Squad } from "./Squad.mjs";
import { Flag } from "arena/season_alpha/capture_the_flag/basic";

var squadMatrix = new CostMatrix();
var melee = [];
var ranged = [];
var healer = [];
var squads = [];
const enemyFlag = getObjectsByPrototype(Flag).filter((t) => t.my != true )[0];

var findSquadMatrix = function () {
    let matrix = new CostMatrix();
    for (let y = 0; y < 100; y++) {
        for (let x = 0; x < 100; x++) {
            let tile = getTerrainAt({x: x, y: y});
            let weight =
                tile === TERRAIN_WALL  ? 255 : // wall  => unwalkable
                tile === TERRAIN_SWAMP ?   5 : // swamp => weight:  5
                                            1 ; // plain => weight:  1
        matrix.set(x, y, weight);
        }
    }
    for (let y = 1; y < 100; y++) for (let x = 1; x < 100; x++) squadMatrix.set(x, y, Math.max(matrix.get(x - 1, y - 1), matrix.get(x, y - 1), matrix.get(x - 1, y), matrix.get(x, y)));
};

var firstTick = function () {
    findSquadMatrix();
    melee = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == ATTACK));
    ranged = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == RANGED_ATTACK));
    healer = getObjectsByPrototype(Creep).filter((c) => c.my && c.body.some((b) => b.type == HEAL));
    squads.push(new Squad(healer.pop(), healer.pop(), ranged.pop(), ranged.pop()));
    squads.push(new Squad(healer.pop(), healer.pop(), ranged.pop(), ranged.pop()));
    for (let s in squads) squads[s].setCostMatrix(squadMatrix);
    firstTick = () => {};
}

export function loop () {
    firstTick();
    if (getTicks() < 10) {
        squads[0].moveTo({x: 50, y: 7}, false);
        squads[1].moveTo({x: 11, y: 19}, false);
    } else {
        squads[0].moveTo(enemyFlag);
        squads[1].moveTo(enemyFlag);
    }
    for (let s in squads) squads[s].logic();
}
