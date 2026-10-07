import {getObjectsByPrototype} from 'game/utils';
import {ATTACK, MOVE, RESOURCE_ENERGY} from 'game/constants';
import {StructureSpawn, Creep} from 'game/prototypes';

export function loop () {
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
    if (mySpawn.store.getCapacity([RESOURCE_ENERGY]) >= 120) mySpawn.spawnCreep([MOVE, ATTACK]);
    const enemySpawn = getObjectsByPrototype(StructureSpawn).find(i => !i.my);
    let creeps = getObjectsByPrototype(Creep);
    for (let c in creeps) {
        var creep = creeps[c];
        if (!creep.my) continue;
        creep.moveTo(enemySpawn);
        creep.attack(enemySpawn);
    }
};
