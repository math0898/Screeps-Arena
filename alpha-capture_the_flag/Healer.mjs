import { SmartCreep } from "./SmartCreep.mjs";
import { ERR_NOT_IN_RANGE, ATTACK } from "game/constants";
import { getTicks } from '/game';

export class Healer extends SmartCreep { // ranged heal and move should be simultanious

    /**
     * The very basic logic for healers.
     * 
     * @param {Creep[]} enemies The current enemies still alive.
     * @param {Creep[]} allies  The current allies still alive.
     */
    healerStuffs (enemies, allies) {
        var target = this.creep.findClosestByPath(allies.filter(c => c.hits < c.hitsMax));
        if (target == null || target == undefined) target = this.creep.findClosestByPath(allies.filter(c => c.body.some(body => body.type == ATTACK)));
        if (this.creep.heal(target) == ERR_NOT_IN_RANGE) {
            this.creep.rangedHeal(target);
            this.creep.moveTo(target);
        }
    }

    /**
     * Runs the tick logic for this creep.
     * 
     * @param {Creep[]} enemies The current enemies still alive.
     * @param {Creep[]} allies  The current allies still alive.
     */
    runLogic (enemies, allies) {
        if (this.mode == 'turtle') {                
            if (getTicks() > 5 && getTicks() < 60) this.moveToTurtle();
            else this.healerStuffs(enemies, allies);
        } else if (this.mode == 'rush') {
            this.creep.heal(this.creep);
            this.creep.moveTo(this.enemyFlag);
        } else this.healerStuffs(enemies, allies);
    }
}
