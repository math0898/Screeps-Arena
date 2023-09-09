// @ts-nocheck
import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn } from 'game/prototypes';
import { ATTACK, MOVE, ERR_NOT_IN_RANGE } from 'game/constants';

export function loop() {
    let mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    let enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
    var creep = undefined;
    if (creep == undefined) creep = mySpawn.spawnCreep([ ATTACK, MOVE ]);
    else {
        if (creep.attack(enemySpawn) == ERR_NOT_IN_RANGE) creep.moveTo(enemySpawn);
    }
    console.log(mySpawn);
    console.log(enemySpawn);
    console.log(creep);
}
