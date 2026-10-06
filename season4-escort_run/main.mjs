import { getTicks, getObjectsByPrototype, findInRange } from 'game/utils';
import { Creep, StructureSpawn } from 'game/prototypes';
import { ATTACK, MOVE, TOUGH, WORK, ERR_NOT_IN_RANGE, RESOURCE_ENERGY } from 'game/constants';

import { EscortCreep } from 'arena/season_4/escort_run/basic';
import { Flag, Structure } from 'game';

const escortCreep = getObjectsByPrototype(EscortCreep).find(i => i.my);
const enemyEscortCreep = getObjectsByPrototype(EscortCreep).find(i => !i.my);
const mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(i => !i.my);
const flag = getObjectsByPrototype(Flag).find(i => i.my);
var currentTick;
var macroDetected = false;
var tug = undefined;

export function loop () {
    currentTick = getTicks();

    if (enemySpawn?.spawning != undefined) {
        let pendingCreep = enemySpawn.spawning.creep.body;
        if (pendingCreep.filter(b => b.type == WORK).length > 0) {
            macroDetected = true;
        }
    }

    if (currentTick == 6 && !macroDetected) {
        // TODO: Check if enemy is attacking, if so defend, otherwise attack.
        mySpawn?.spawnCreep([MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]);
    } else if (macroDetected && mySpawn.store.getCapacity([RESOURCE_ENERGY]) >= 480 && tug == undefined) {
        tug = mySpawn?.spawnCreep([MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK]);
        if (tug != undefined) tug = tug.object;
    } else if (currentTick > 6 && mySpawn.store.getCapacity([RESOURCE_ENERGY]) >= 180) {
        mySpawn?.spawnCreep([MOVE, MOVE, ATTACK]);
    }


    var targets = getObjectsByPrototype(Creep).filter(c => !c.my);
    let targetsNearEscort = findInRange(escortCreep, targets, 6); // TODO: Filter to nearest.

    if (tug == undefined || tug?.spawning || targetsNearEscort.length > 1) { // Rush to flag, or run.
        escortCreep?.moveTo(flag);
        // Escort is under attack.
        if (tug != undefined && targetsNearEscort.length > 1) {
            if (tug.attack(targetsNearEscort[0]) == ERR_NOT_IN_RANGE) {
                tug.moveTo(targetsNearEscort[0]);
            }
        }
    } else if (targetsNearEscort.length == 0) { // No enemies nearby, utilize tug and push to flag.
        if (escortCreep?.getRangeTo(tug) <= 1) {
            tug.moveTo(flag);
            tug.pull(escortCreep);
            escortCreep?.moveTo(tug);
        } else {
            tug.moveTo(escortCreep);
            escortCreep?.moveTo(flag);
        }
    }


    let creeps = getObjectsByPrototype(Creep);
    for (let c in creeps) {
        let creep = creeps[c];
        if (!creep.my || creep.spawning) continue;
        if (creep instanceof EscortCreep) continue;
        if (creep == tug) continue;

        targets = getObjectsByPrototype(Creep).filter(c => !c.my);
        targetsNearEscort = findInRange(escortCreep, targets, 5); // TODO: Filter to nearest.

        if ((creep.body.length > 5 && currentTick < 130) || macroDetected) { // Body Guard logic
            if (targetsNearEscort.length > 0) {
                if (creep.attack(targetsNearEscort[0]) == ERR_NOT_IN_RANGE) creep.moveTo(targetsNearEscort[0]);
            } else if (targets.length == 1) { // Only enemy escort creep is alive.
                if (creep.attack(targets[0]) == ERR_NOT_IN_RANGE) creep.moveTo(targets[0]);
            } else {
                let targetsNearCreep = findInRange(creep, targets, 5);
                if (targetsNearCreep.length != 0) {
                    var nearest = creep.findClosestByPath(targetsNearCreep);
                    if (creep.attack(nearest) == ERR_NOT_IN_RANGE) creep.moveTo(nearest); // Handle Nearby Threats
                } else if (macroDetected) creep.moveTo(escortCreep);
                else creep.moveTo({x: 50, y: 50});
            }
        } else {
            // This should only be enemies that can attack.
            targets = getObjectsByPrototype(Creep).filter(c => !c.my && (c.body.filter(b => b.type == ATTACK).length > 0));
            let targetsNearCreep = findInRange(creep, targets, 1);
 
            let targetsNearFlag = getObjectsByPrototype(Creep).filter(c => !c.my && c != enemyEscortCreep && flag?.getRangeTo(c) < 3);

            if (targetsNearCreep.length != 0) creep.attack(targetsNearCreep[0]); // Handle Nearby Threats
            else if (targetsNearFlag.length != 0 && currentTick > 300) {
                if (creep.attack(targetsNearFlag[0]) == ERR_NOT_IN_RANGE) creep.moveTo(targetsNearFlag[0]);
            } else {
                targets = getObjectsByPrototype(Creep).filter(c => !c.my && c != enemyEscortCreep);
                targetsNearCreep = findInRange(creep, targets, 5);
                if (targetsNearCreep.length != 0) {
                    var nearest = creep.findClosestByPath(targetsNearCreep);
                    if (creep.attack(nearest) == ERR_NOT_IN_RANGE) creep.moveTo(nearest); // Handle Nearby Threats
                } else if (creep.attack(enemyEscortCreep) == ERR_NOT_IN_RANGE) creep.moveTo(enemyEscortCreep);
            }
        }
    }
}