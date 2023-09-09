// @ts-nocheck
import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn, Creep, StructureContainer } from 'game/prototypes';
import { ATTACK, MOVE, ERR_NOT_IN_RANGE, RANGED_ATTACK, RESOURCE_ENERGY } from 'game/constants';

var fillers = new Array();
var squads = new Array();
var awaitingSquad = new Array();
const mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
var added = true;

export function loop() {
    if (!added) {
        if (mySpawn.spawning.creep.body.findIndex(CARRY) != -1) fillers.push(mySpawn.spawning.creep);
        else awaitingSquad.push(mySpawn.spawning.creep);
        added = true;
    }
    if (mySpawn.store.getUsedCapacity() > 300 && fillers.length < 3) {
        mySpawn.spawnCreep([ CARRY, CARRY, CARRY, MOVE, MOVE, MOVE ]);
        added = false;
    } else if (mySpawn.store.getUsedCapacity() > 600 && awaitingSquad.length < 2) {
        mySpawn.spawnCreep([ HEAL, HEAL, MOVE, MOVE ]);
        added = false;
    } else if (mySpawn.store.getUsedCapacity() > 400 && awaitingSquad.length < 4) {
        mySpawn.spawnCreep([ RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE]);
        added = false;
    }

    if (awaitingSquad.length == 4); // TODO: Create Squad

    // Filler Logic
    let containers = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity() > 0);
    for (let f in fillers) {
        let filler = fillers[f];
        if (filler.store.getFreeCapacity() > 0) {
            let container = filler.findClosestByPath(containers);
            if (filler.withdrawl(container) == ERR_NOT_IN_RANGE) creep.moveTo(container);
        } else if (filler.transfer(mySpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(mySpawn);
    }

    // let creeps = getObjectsByPrototype(Creep).filter(c => c.my);
    // mySpawn.spawnCreep([ ATTACK, MOVE ]);
    // for (let c in creeps) {
    //     let creep = creeps[c];
    //     if (creep.attack(enemySpawn) == ERR_NOT_IN_RANGE) creep.moveTo(enemySpawn);
    // }
}
