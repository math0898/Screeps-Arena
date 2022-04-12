import { getObjectsByPrototype, findInRange } from '/game/utils';
import { Creep, StructureSpawn, ScoreCollector } from '/game/prototypes';
import { ATTACK, RANGED_ATTACK, HEAL, MOVE, WORK, CARRY } from '/game/constants';
import { } from '/arena';
import { Harvester } from './Harvester.mjs';

/**
 * Make execution loop of this AI.
 * 
 * @author Sugaku
 */
export function loop () {

    const spawn = getObjectsByPrototype(StructureSpawn).find(s => s.my);
    const scoreContainer = getObjectsByPrototype(ScoreCollector).find(s => true);

    var creeps = getObjectsByPrototype(Creep).filter(c => c.my);
    var harvesters = getObjectsByPrototype(Creep).filter(h => h.my && h.role == 'harvester');

    if (harvesters.length < 3 && spawn.store[RESOURCE_ENERGY] >= 500) {
        const obj = spawn.spawnCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE]);
        obj.role = 'harvester';
    }

    for (var c of creeps) {
        switch (c.role) {
            case undefined: c.role = 'harvester';
            case 'harvester': Harvester.runLogic(c); break;
        }
    }
}
