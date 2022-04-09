import { findInRange } from '/game/utils'
import { SmartCreep } from "./SmartCreep.mjs";
import { ERR_NOT_IN_RANGE } from '/game/constants';

/**
 * The ranger class is for creeps who fill the ranger role.
 * 
 * @author Sugaku
 */
export class Ranger extends SmartCreep {

    /**
     * Runs the defense logic for a ranger object.
     * 
     * @param {Creep[]} enemies  The current enemies still alive.
     * @param {Creep[]} allies   The current allies still alive.
     */
    defend (enemies, allies) { // todo perhaps break down further.
        const target = this.myFlag.findClosestByRange(enemies);
        const inRange = findInRange(this.creep, enemies, 3);
        const inFlagRange = findInRange(this.myFlag, enemies, 2);
        if (inRange.length < 3 || inFlagRange.length == 1) {
            if (this.creep.rangedAttack(target) == ERR_NOT_IN_RANGE) this.creep.moveTo(target);
        } else this.creep.rangedMassAttack();
    }

    /**
     * Runs the attack logic for a ranger creep.
     * 
     * @param {Creep[]} enemies The current enemies still alive. 
     * @param {Creep[]} allies  The current allies still alive.
     */
    attack (enemies, allies) { // todo perhaps break down further.
        const target = this.creep.findClosestByPath(enemies);
        const inRange = findInRange(this.creep, enemies, 3);
        if (inRange < 3) {
            if (this.creep.rangedAttack(target) == ERR_NOT_IN_RANGE) this.creep.moveTo(target);
        } else this.creep.rangedMassAttack();
    
        if (enemies.length == 0) this.creep.moveTo(this.enemyFlag);
    }

    /**
     * Runs the tick logic for this creep.
     * 
     * @param {Creep[]} enemies The current enemies still alive.
     * @param {Creep[]} allies  The current allies still alive.
     */
     runLogic (enemies, allies) {
        if (this.logic == undefined) this.logic = 'defend'; 
        switch (this.logic) {
            case 'defend': this.defend(enemies, allies); break;
            case 'attack': this.attack(enemies, allies); break;
        }
    }
}
