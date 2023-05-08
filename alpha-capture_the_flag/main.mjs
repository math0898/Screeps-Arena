import { ATTACK, HEAL, RANGED_ATTACK, TERRAIN_PLAIN, TERRAIN_SWAMP, TERRAIN_WALL } from "game/constants";
import { Creep, StructureTower } from "game/prototypes";
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
const alliedFlag = getObjectsByPrototype(Flag).filter((t) => t.my )[0];
const towers = getObjectsByPrototype(StructureTower).filter((t) => t.my);
var flagDefender;
var flagRusher;

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
    flagDefender = melee.pop();
    flagRusher = melee.pop();
    squads.push(new Squad(healer.pop(), healer.pop(), ranged.pop(), ranged.pop()));
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
        squads[2].moveTo({x: 5, y: 5}, false);
    } else {
        squads[0].moveTo(enemyFlag);
        squads[1].moveTo(enemyFlag);
        squads[2].moveTo({x: 5, y: 5});
    }
    for (let s in squads) squads[s].logic();
    flagDefender.moveTo(alliedFlag); // TODO: Actual logic
    flagRusher.moveTo(enemyFlag);
    for (let t in towers) if (flagDefender.hits < flagDefender.hitsMax) towers[t].heal(flagDefender); // TODO: More advanced tower logic needed.
}
