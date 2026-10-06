import { getObjectsByPrototype } from 'game/utils';
import { StructureSpawn, StructureContainer, Creep } from 'game/prototypes';
import { MOVE, CARRY, ERR_NOT_IN_RANGE } from 'game/constants';
import { RESOURCE_SCORE, ScoreCollector } from 'arena/season_alpha/collect_and_control/basic';

let creep;

export function loop() {
    let creeps = getObjectsByPrototype(Creep).filter(c => c.my);
    var mySpawn = getObjectsByPrototype(StructureSpawn).find(obj => obj.my);
    var creepBody = [MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,CARRY,CARRY];
    mySpawn.spawnCreep(creepBody);
    for (let c in creeps) {
        let creep = creeps[c];
        if(creep.store[RESOURCE_SCORE] > 0) {
            var scoreCollector = getObjectsByPrototype(ScoreCollector)[0];
            if(creep.transfer(scoreCollector, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
                creep.moveTo(scoreCollector);
            }
        } else {
            var containers = getObjectsByPrototype(StructureContainer);
            if(containers.length > 0) {
                var container = creep.findClosestByPath(containers);
                if(creep.withdraw(container, RESOURCE_SCORE) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(container);
                }
            }
        }
    }
}
