import {getObjectsByPrototype} from 'game/utils';
import {ATTACK, MOVE, RESOURCE_ENERGY} from 'game/constants';
import {StructureSpawn, Creep} from 'game/prototypes';

const mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
const enemySpawn = getObjectsByPrototype(StructureSpawn).find(i => !i.my);
var myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);

export function loop () {

    if (mySpawn.store.getCapacity([RESOURCE_ENERGY]) >= 120) mySpawn.spawnCreep([MOVE, ATTACK]);
    myCreeps = getObjectsByPrototype(Creep).filter(c => c.my);
    for (let c in myCreeps) {
        var creep = myCreeps[c];
        creep.moveTo(enemySpawn);
        creep.attack(enemySpawn);
    }
};
