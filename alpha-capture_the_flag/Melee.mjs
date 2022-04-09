import { SmartCreep } from "./SmartCreep.mjs";
import { ERR_NOT_IN_RANGE } from "game/constants";

export class Melee extends SmartCreep {

    /**
     * Runs the defense logic for this melee creep.
     * 
     * @param {Creep[]} enemies The list of enemies currently still alive.
     */
    defend (enemies) {
        const target = this.creep.findClosestByPath(enemies);
        if (this.creep.attack(target) == ERR_NOT_IN_RANGE) this.creep.moveTo(target);
    }
    
    /**
     * Runs the attack logic for this melee creep.
     * 
     * @param {Creep[]} enemies The list of enemies currently still alive.
     */
    attack (enemies) {
        const target = this.creep.findClosestByPath(enemies);
        if (this.creep.attack(target) == ERR_NOT_IN_RANGE) this.creep.moveTo(target);
        if (enemies.length == 0) this.creep.moveTo(this.enemyFlag);
    }

    /**
     * Runs the tick logic for this creep.
     * 
     * @param {Creep[]} enemies The current enemies still alive.
     * @param {Creep[]} allies  The current allies still alive.
     */
    runLogic (enemies, allies) {
        if (this.mode == undefined) this.mode = 'defend'; 
        switch (this.mode) {
            case 'defend': this.defend(enemies); break;
            case 'attack': this.attack(enemies); break;
        }
    }
}
