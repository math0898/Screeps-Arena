// @ts-nocheck
import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn, Creep } from 'game/prototypes';
import { ATTACK, MOVE, ERR_NOT_IN_RANGE } from 'game/constants';

export function loop() {
    let mySpawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    let enemySpawn = getObjectsByPrototype(StructureSpawn).find(s => !s.my);
    let creeps = getObjectsByPrototype(Creep).filter(c => c.my);
    mySpawn.spawnCreep([ ATTACK, MOVE ]);
    for (let c in creeps) {
        let creep = creeps[c];
        if (creep.attack(enemySpawn) == ERR_NOT_IN_RANGE) creep.moveTo(enemySpawn);
    }
}
