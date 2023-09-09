// @ts-nocheck
import { getObjectsByPrototype, getTerrainAt } from 'game/utils';
import { CostMatrix } from "game/path-finder";
import { StructureSpawn, Creep, StructureContainer } from 'game/prototypes';
import { ATTACK, MOVE, CARRY, ERR_NOT_IN_RANGE, RANGED_ATTACK, RESOURCE_ENERGY, HEAL, TERRAIN_PLAIN, TERRAIN_SWAMP, TERRAIN_WALL } from 'game/constants';
import { Squad } from './Squad.mjs';

var fillers = new Array();
var squads = new Array();
var awaitingSquad = new Array();
const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
var added = true;
var squadMatrix = new CostMatrix();

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

findSquadMatrix();

export function loop() {
    if (!added) {
        if (mySpawn.spawning.creep.body.findIndex(b => b.type == CARRY) != -1) fillers.push(mySpawn.spawning.creep);
        else awaitingSquad.push(mySpawn.spawning.creep);
        added = true;
    }
    if (mySpawn.store.getUsedCapacity(RESOURCE_ENERGY) > 300 && fillers.length < 3 && mySpawn.spawning == undefined) {
        mySpawn.spawnCreep([ CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ]);
        added = false;
    } else if (mySpawn.store.getUsedCapacity(RESOURCE_ENERGY) > 600 && awaitingSquad.length < 2 && mySpawn.spawning == undefined) {
        mySpawn.spawnCreep([ HEAL, HEAL, MOVE, MOVE ]);
        added = false;
    } else if (mySpawn.store.getUsedCapacity(RESOURCE_ENERGY) > 400 && awaitingSquad.length < 4 && mySpawn.spawning == undefined) {
        mySpawn.spawnCreep([ RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE ]);
        added = false;
    }

    if (awaitingSquad.length == 4) {
        squads.push(new Squad(awaitingSquad.pop(), awaitingSquad.pop(), awaitingSquad.pop(), awaitingSquad.pop()));
        squads[squads.length - 1].setCostMatrix(squadMatrix);
    }

    // Filler Logic
    let containers = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity() > 0);
    for (let f in fillers) {
        let filler = fillers[f];
        if (filler.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            let container = filler.findClosestByPath(containers);
            if (filler.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) filler.moveTo(container);
        } else if (filler.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) filler.moveTo(mySpawn);
    }

    // Squad Logic
    for (let s in squads) {
        let squad = squads[s];
        squad.moveTo(enemySpawn);
        squad.logic();
    }

    // let creeps = getObjectsByPrototype(Creep).filter(c => c.my);
    // mySpawn.spawnCreep([ ATTACK, MOVE ]);
    // for (let c in creeps) {
    //     let creep = creeps[c];
    //     if (creep.attack(enemySpawn) == ERR_NOT_IN_RANGE) creep.moveTo(enemySpawn);
    // }
}
