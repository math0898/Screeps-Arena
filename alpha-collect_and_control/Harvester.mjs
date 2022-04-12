import { findClosestByPath, getObjectsByPrototype } from "/game/utils";
import { Source } from "/game/prototypes";
import { ERR_NOT_IN_RANGE } from "/game/constants";

/**
 * The harvester class contains all the logic for harvester creeps.
 * 
 * @author Sugaku
 */
export class Harvester {

    /**
     * Runs the logic of a harvester on the given creep. May need to be restructured in the future.
     * 
     * @param { Creep } creep 
     */
    static runLogic (creep) {
        if (creep.spawning) return;
        if (creep.source == undefined) creep.source = findClosestByPath(creep, getObjectsByPrototype(Source));
        if (creep.spawn == undefined) creep.spawn = findClosestByPath(creep, getObjectsByPrototype(StructureSpawn));
        if (creep.store.energy < creep.store.getCapacity()) {
            if (creep.harvest(creep.source) == ERR_NOT_IN_RANGE) creep.moveTo(creep.source);
        } else {
            if (creep.transfer(creep.spawn) == ERR_NOT_IN_RANGE) creep.moveTo(creep.spawn);
        }
    }
}
