import {getObjectsByPrototype} from 'game/utils';
import {ATTACK, MOVE} from 'game/constants';
import {StructureSpawn} from 'game/prototypes';

let attacker;

export function loop() {
    if(!attacker) {
        var mySpawn = getObjectsByPrototype(StructureSpawn).find(i => i.my);
        attacker = mySpawn.spawnCreep([MOVE, ATTACK]).object;
    }
    else {
        const enemySpawn = getObjectsByPrototype(StructureSpawn).find(i => !i.my);
        attacker.moveTo(enemySpawn);
        attacker.attack(enemySpawn);
    }
}