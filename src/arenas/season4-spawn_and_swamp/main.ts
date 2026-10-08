import { getTicks, getObjectsByPrototype } from 'game/utils';
import { ATTACK, MOVE, RESOURCE_ENERGY } from 'game/constants';
import { StructureSpawn, Creep } from 'game/prototypes';
import { CARRY, ERR_NOT_IN_RANGE, StructureContainer, StructureWall } from 'game';
import { CombatLibs } from '@lib/Combat.js';

const mySpawn: StructureSpawn | undefined = getObjectsByPrototype(StructureSpawn).find(i => i.my);
const enemySpawn: StructureSpawn | undefined = getObjectsByPrototype(StructureSpawn).find(i => !i.my);
var myCreeps: Creep[] = getObjectsByPrototype(Creep).filter(c => c.my);
var containers: StructureContainer[] = getObjectsByPrototype(StructureContainer);
const nearWall: StructureWall | undefined = mySpawn?.findClosestByRange(getObjectsByPrototype(StructureWall));

export function loop () {

    if (mySpawn != undefined && mySpawn != null) {
        const energy: number | null = mySpawn.store.getUsedCapacity(RESOURCE_ENERGY);
        const gameTick: number = getTicks();
        const carryCreeps = myCreeps.filter(c => c != undefined && c.body != undefined && c.body.find(b => b.type == CARRY) != undefined).length;
        if (energy != null && mySpawn.spawning == null) {
            if (gameTick == 1) mySpawn.spawnCreep([MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK]);
            else if (carryCreeps < 2 && energy > 200) mySpawn.spawnCreep([MOVE, MOVE, CARRY, CARRY]);
            else if (carryCreeps >= 2 && energy >= 120) mySpawn.spawnCreep([MOVE, ATTACK]);
        }
    }

    myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);
    containers = getObjectsByPrototype(StructureContainer).filter(s => s.store.getUsedCapacity(RESOURCE_ENERGY) != null);
    for (let c in myCreeps) {
        var creep: Creep = myCreeps[c];
        if (creep.body == undefined) continue; // Strange bug, but whatever.
        if (creep.body.find(b => b.type == ATTACK) != undefined) { // Attack Creeps
            var nearbyEnemies = CombatLibs.nearbyEnemyCreeps(creep, 3);
            if (nearbyEnemies.length > 0) {
                for (let e in nearbyEnemies) { // This looks funky but it sets up a command to attack which should mean we
                    var enemy: Creep = nearbyEnemies[e]; // always attack if able.
                    creep.attack(enemy);
                }
                var lowestHealth = CombatLibs.lowestHealthCreep(nearbyEnemies);
                if (lowestHealth != undefined && creep.attack(lowestHealth) == ERR_NOT_IN_RANGE)
                    creep.moveTo(lowestHealth);
            } else if (nearWall != undefined && nearWall.hits != undefined && nearWall.hits > 0) {
                creep.moveTo(nearWall);
                creep.attack(nearWall);
            } else if (enemySpawn != undefined) {
                creep.moveTo(enemySpawn);
                console.log(creep.attack(enemySpawn));
            }
        } else { // Carry Creeps
            const container = creep.findClosestByRange(containers);
            if (creep.store != null) {
                const energy: number | null = creep.store.getUsedCapacity(RESOURCE_ENERGY);
                if (energy != null && energy > 0 && mySpawn != undefined) {
                    if (creep.transfer(mySpawn, RESOURCE_ENERGY, energy) == ERR_NOT_IN_RANGE) creep.moveTo(mySpawn);
                } else {
                    if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) creep.moveTo(container);
                }
            }
        }
    }
};
