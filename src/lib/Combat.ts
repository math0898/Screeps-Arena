import { getObjectsByPrototype, findInRange } from 'game/utils';
import { Creep } from 'game/prototypes';

/**
 * Libaries used to make combat in ScreepsArena simplier.
 * 
 * @author Sugaku
 */
export class CombatLibs {

    /**
     * A quick shorthand way to reference all enemies currently visible.
     * 
     * @returns Creep[] contains all visible enemies. In a one room scenario this is everyone.
     */
    static globalEnemyCreeps (): Creep[] {
        const enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
        return enemies;
    }

    /**
     * A quick shorthand way to reference all allies currently visible.
     * 
     * @returns Creep[] contains all visible creeps. This will always be all owned creeps.
     */
    static globalAlliedCreeps (): Creep[] {
        const allies = getObjectsByPrototype(Creep).filter(c => c.my);
        return allies;
    }

    /**
     * Locates enemies near the given position.
     * 
     * @param pos The position to check around.
     * @param near How far is considered near?
     * @returns Creep[] - A list of enemies that are nearby.
     */
    static nearbyEnemyCreeps (pos: {x: number, y: number}, near: number = 3): Creep[] {
        const enemies = this.globalEnemyCreeps();
        return findInRange(pos, enemies, near);
    }

    /**
     * Locates allies near the given position.
     * 
     * @param pos The position to check around.
     * @param near How far is considered near?
     * @returns Creep[] - A list of allies that are nearby.
     */
    static nearbyAlliedCreeps (pos: {x: number, y: number}, near: number = 3): Creep[] {
        const allies = this.globalAlliedCreeps();
        return findInRange(pos, allies, near);
    }

    /**
     * Determines the lowest health creep in the given array.
     * 
     * @param creeps The list of creeps to filter through.
     * @param minDamage The minimum amount of damage that the creep must have had.
     * @returns Creep - The lowest health unit.
     */
    static lowestHealthCreep (creeps: Creep[], minDamage: number = 0): Creep | undefined {
        if (creeps.length == 0) return undefined;
        var lowestHealth: number = -1;
        var lowestIndex: number = -1;
        for (var i = 0; i < creeps.length; i++) {
            if (creeps[i].hits <= creeps[i].hitsMax - minDamage) {
                lowestHealth = creeps[i].hits;
                lowestIndex = i;
                break;
            }
        }
        if (lowestHealth == -1) return undefined;
        for (var i = lowestIndex + 1; i < creeps.length; i++) {
            if (creeps[i] == undefined) continue;
            if (creeps[i].hits < lowestHealth) {
                lowestHealth = creeps[i].hits;
                lowestIndex = i;
            }
        }
        return creeps[lowestIndex];
    }
};
