import { getObjectsByPrototype, findInRange } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ScoreFlag } from 'arena/season_4/pain_and_gain/basic';
import { RANGED_ATTACK, HEAL, ATTACK } from 'game/constants';

/**
 * Libaries used to make combat in ScreepsArena simplier.
 *
 * @author Sugaku
 */
class CombatLibs {
    /**
     * A quick shorthand way to reference all enemies currently visible.
     *
     * @returns Creep[] contains all visible enemies. In a one room scenario this is everyone.
     */
    static globalEnemyCreeps() {
        const enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
        return enemies;
    }
    /**
     * A quick shorthand way to reference all allies currently visible.
     *
     * @returns Creep[] contains all visible creeps. This will always be all owned creeps.
     */
    static globalAlliedCreeps() {
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
    static nearbyEnemyCreeps(pos, near = 3) {
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
    static nearbyAlliedCreeps(pos, near = 3) {
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
    static lowestHealthCreep(creeps, minDamage = 0) {
        if (creeps.length == 0)
            return undefined;
        var lowestHealth = -1;
        var lowestIndex = -1;
        for (var i = 0; i < creeps.length; i++) {
            if (creeps[i].hits <= creeps[i].hitsMax - minDamage) {
                lowestHealth = creeps[i].hits;
                lowestIndex = i;
                break;
            }
        }
        if (lowestHealth == -1)
            return undefined;
        for (var i = lowestIndex + 1; i < creeps.length; i++) {
            if (creeps[i] == undefined)
                continue;
            if (creeps[i].hits < lowestHealth) {
                lowestHealth = creeps[i].hits;
                lowestIndex = i;
            }
        }
        return creeps[lowestIndex];
    }
}

var flags;
var fighting = false;
var claimedFlags = 1;
function updateFlags() {
    flags = getObjectsByPrototype(ScoreFlag);
}
function loop() {
    updateFlags();
    fighting = false;
    var flag = getObjectsByPrototype(ScoreFlag)[0];
    var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);
    for (var creep of myCreeps) {
        if (creep.body.filter(b => b.type == RANGED_ATTACK && b.hits > 0).length > 0) {
            const targets = CombatLibs.nearbyEnemyCreeps(creep);
            if (targets.length >= 3) {
                creep.rangedMassAttack(); // AOE is highest DPS here
                fighting = true;
            }
            else if (targets.length > 0) { // Execute lowest health first.
                const target = CombatLibs.lowestHealthCreep(targets);
                creep.rangedAttack(target);
                fighting = true;
            }
        }
        else if (creep.body.filter(b => b.type == HEAL && b.hits > 0).length > 0) {
            const healBodyparts = creep.body.filter(b => b.type == HEAL && b.hits > 0).length;
            const meleeAllies = CombatLibs.nearbyAlliedCreeps(creep, 1);
            const lowestHealthMelee = CombatLibs.lowestHealthCreep(meleeAllies, healBodyparts * 12);
            if (lowestHealthMelee != undefined) { // Melee healing is the strongest. This should automatically handle self healing.
                creep.heal(lowestHealthMelee);
            }
            else {
                const rangedAllies = CombatLibs.nearbyAlliedCreeps(creep); // Ranged healing is a bit weaker.
                const lowestHealthRanged = CombatLibs.lowestHealthCreep(rangedAllies, healBodyparts * 4);
                if (lowestHealthRanged != undefined) {
                    creep.rangedHeal(lowestHealthRanged);
                }
            }
        }
        else if (creep.body.filter(b => b.type == ATTACK && b.hits > 0).length > 0) {
            const targets = CombatLibs.nearbyEnemyCreeps(creep, 1);
            if (targets.length > 0) {
                const target = CombatLibs.lowestHealthCreep(targets);
                creep.attack(target);
                fighting = true;
            }
        }
        else {
            if (creep.targetFlag == undefined) {
                creep.targetFlag = flags[claimedFlags];
                claimedFlags++;
            }
        }
        if (!fighting) {
            creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag);
        }
        else {
            if (creep.getRangeTo(creep.targetFlag == undefined ? flag : creep.targetFlag) > 1) {
                creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag); // Too far to activate, we can get closer.
            }
        }
    }
}

export { loop };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5tanMiLCJzb3VyY2VzIjpbIi4uL3NjcmVlcHMtZGV2L3NyYy9saWIvQ29tYmF0LnRzIiwiLi4vc2NyZWVwcy1kZXYvc3JjL2FyZW5hcy9zZWFzb240LXBhaW5fYW5kX2dhaW4vbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRPYmplY3RzQnlQcm90b3R5cGUsIGZpbmRJblJhbmdlIH0gZnJvbSAnZ2FtZS91dGlscyc7XG5pbXBvcnQgeyBDcmVlcCB9IGZyb20gJ2dhbWUvcHJvdG90eXBlcyc7XG5cbi8qKlxuICogTGliYXJpZXMgdXNlZCB0byBtYWtlIGNvbWJhdCBpbiBTY3JlZXBzQXJlbmEgc2ltcGxpZXIuXG4gKiBcbiAqIEBhdXRob3IgU3VnYWt1XG4gKi9cbmV4cG9ydCBjbGFzcyBDb21iYXRMaWJzIHtcblxuICAgIC8qKlxuICAgICAqIEEgcXVpY2sgc2hvcnRoYW5kIHdheSB0byByZWZlcmVuY2UgYWxsIGVuZW1pZXMgY3VycmVudGx5IHZpc2libGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgQ3JlZXBbXSBjb250YWlucyBhbGwgdmlzaWJsZSBlbmVtaWVzLiBJbiBhIG9uZSByb29tIHNjZW5hcmlvIHRoaXMgaXMgZXZlcnlvbmUuXG4gICAgICovXG4gICAgc3RhdGljIGdsb2JhbEVuZW15Q3JlZXBzICgpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgZW5lbWllcyA9IGdldE9iamVjdHNCeVByb3RvdHlwZShDcmVlcCkuZmlsdGVyKGMgPT4gIWMubXkpO1xuICAgICAgICByZXR1cm4gZW5lbWllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHF1aWNrIHNob3J0aGFuZCB3YXkgdG8gcmVmZXJlbmNlIGFsbCBhbGxpZXMgY3VycmVudGx5IHZpc2libGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgQ3JlZXBbXSBjb250YWlucyBhbGwgdmlzaWJsZSBjcmVlcHMuIFRoaXMgd2lsbCBhbHdheXMgYmUgYWxsIG93bmVkIGNyZWVwcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2xvYmFsQWxsaWVkQ3JlZXBzICgpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgYWxsaWVzID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKENyZWVwKS5maWx0ZXIoYyA9PiBjLm15KTtcbiAgICAgICAgcmV0dXJuIGFsbGllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGVzIGVuZW1pZXMgbmVhciB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIHBvcyBUaGUgcG9zaXRpb24gdG8gY2hlY2sgYXJvdW5kLlxuICAgICAqIEBwYXJhbSBuZWFyIEhvdyBmYXIgaXMgY29uc2lkZXJlZCBuZWFyP1xuICAgICAqIEByZXR1cm5zIENyZWVwW10gLSBBIGxpc3Qgb2YgZW5lbWllcyB0aGF0IGFyZSBuZWFyYnkuXG4gICAgICovXG4gICAgc3RhdGljIG5lYXJieUVuZW15Q3JlZXBzIChwb3M6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIG5lYXI6IG51bWJlciA9IDMpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgZW5lbWllcyA9IHRoaXMuZ2xvYmFsRW5lbXlDcmVlcHMoKTtcbiAgICAgICAgcmV0dXJuIGZpbmRJblJhbmdlKHBvcywgZW5lbWllcywgbmVhcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9jYXRlcyBhbGxpZXMgbmVhciB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIHBvcyBUaGUgcG9zaXRpb24gdG8gY2hlY2sgYXJvdW5kLlxuICAgICAqIEBwYXJhbSBuZWFyIEhvdyBmYXIgaXMgY29uc2lkZXJlZCBuZWFyP1xuICAgICAqIEByZXR1cm5zIENyZWVwW10gLSBBIGxpc3Qgb2YgYWxsaWVzIHRoYXQgYXJlIG5lYXJieS5cbiAgICAgKi9cbiAgICBzdGF0aWMgbmVhcmJ5QWxsaWVkQ3JlZXBzIChwb3M6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIG5lYXI6IG51bWJlciA9IDMpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgYWxsaWVzID0gdGhpcy5nbG9iYWxBbGxpZWRDcmVlcHMoKTtcbiAgICAgICAgcmV0dXJuIGZpbmRJblJhbmdlKHBvcywgYWxsaWVzLCBuZWFyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBsb3dlc3QgaGVhbHRoIGNyZWVwIGluIHRoZSBnaXZlbiBhcnJheS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY3JlZXBzIFRoZSBsaXN0IG9mIGNyZWVwcyB0byBmaWx0ZXIgdGhyb3VnaC5cbiAgICAgKiBAcGFyYW0gbWluRGFtYWdlIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBkYW1hZ2UgdGhhdCB0aGUgY3JlZXAgbXVzdCBoYXZlIGhhZC5cbiAgICAgKiBAcmV0dXJucyBDcmVlcCAtIFRoZSBsb3dlc3QgaGVhbHRoIHVuaXQuXG4gICAgICovXG4gICAgc3RhdGljIGxvd2VzdEhlYWx0aENyZWVwIChjcmVlcHM6IENyZWVwW10sIG1pbkRhbWFnZTogbnVtYmVyID0gMCk6IENyZWVwIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGNyZWVwcy5sZW5ndGggPT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGxvd2VzdEhlYWx0aDogbnVtYmVyID0gLTE7XG4gICAgICAgIHZhciBsb3dlc3RJbmRleDogbnVtYmVyID0gLTE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3JlZXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY3JlZXBzW2ldLmhpdHMgPD0gY3JlZXBzW2ldLmhpdHNNYXggLSBtaW5EYW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBsb3dlc3RIZWFsdGggPSBjcmVlcHNbaV0uaGl0cztcbiAgICAgICAgICAgICAgICBsb3dlc3RJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvd2VzdEhlYWx0aCA9PSAtMSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IGxvd2VzdEluZGV4ICsgMTsgaSA8IGNyZWVwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNyZWVwc1tpXSA9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGNyZWVwc1tpXS5oaXRzIDwgbG93ZXN0SGVhbHRoKSB7XG4gICAgICAgICAgICAgICAgbG93ZXN0SGVhbHRoID0gY3JlZXBzW2ldLmhpdHM7XG4gICAgICAgICAgICAgICAgbG93ZXN0SW5kZXggPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVlcHNbbG93ZXN0SW5kZXhdO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRPYmplY3RzQnlQcm90b3R5cGUgfSBmcm9tICdnYW1lL3V0aWxzJztcbmltcG9ydCB7IENyZWVwIH0gZnJvbSAnZ2FtZS9wcm90b3R5cGVzJztcbmltcG9ydCB7IFNjb3JlRmxhZyB9IGZyb20gJ2FyZW5hL3NlYXNvbl80L3BhaW5fYW5kX2dhaW4vYmFzaWMnO1xuaW1wb3J0IHsgQ29tYmF0TGlicyB9IGZyb20gJ0BsaWIvQ29tYmF0LmpzJztcbmltcG9ydCB7IFJBTkdFRF9BVFRBQ0ssIEFUVEFDSywgSEVBTCB9IGZyb20gJ2dhbWUvY29uc3RhbnRzJztcblxudmFyIGZsYWdzOiBTY29yZUZsYWdbXTtcbnZhciBmaWdodGluZzogYm9vbGVhbiA9IGZhbHNlO1xudmFyIGNsYWltZWRGbGFnczogbnVtYmVyID0gMTtcblxuZnVuY3Rpb24gdXBkYXRlRmxhZ3MgKCkge1xuICAgIGZsYWdzID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKFNjb3JlRmxhZyk7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gbG9vcCAoKSB7XG4gICAgdXBkYXRlRmxhZ3MoKTtcbiAgICBmaWdodGluZyA9IGZhbHNlO1xuICAgIHZhciBmbGFnID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKFNjb3JlRmxhZylbMF07XG4gICAgdmFyIG15Q3JlZXBzID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKENyZWVwKS5maWx0ZXIob2JqZWN0ID0+IG9iamVjdC5teSk7XG4gICAgZm9yICh2YXIgY3JlZXAgb2YgbXlDcmVlcHMpIHtcblxuICAgICAgICBpZiAoY3JlZXAuYm9keS5maWx0ZXIoYiA9PiBiLnR5cGUgPT0gUkFOR0VEX0FUVEFDSyAmJiBiLmhpdHMgPiAwKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gQ29tYmF0TGlicy5uZWFyYnlFbmVteUNyZWVwcyhjcmVlcCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0cy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIGNyZWVwLnJhbmdlZE1hc3NBdHRhY2soKTsgLy8gQU9FIGlzIGhpZ2hlc3QgRFBTIGhlcmVcbiAgICAgICAgICAgICAgICBmaWdodGluZyA9IHRydWU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRhcmdldHMubGVuZ3RoID4gMCkgeyAvLyBFeGVjdXRlIGxvd2VzdCBoZWFsdGggZmlyc3QuXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gQ29tYmF0TGlicy5sb3dlc3RIZWFsdGhDcmVlcCh0YXJnZXRzKTtcbiAgICAgICAgICAgICAgICBjcmVlcC5yYW5nZWRBdHRhY2sodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBmaWdodGluZyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3JlZXAuYm9keS5maWx0ZXIoYiA9PiBiLnR5cGUgPT0gSEVBTCAmJiBiLmhpdHMgPiAwKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBoZWFsQm9keXBhcnRzID0gY3JlZXAuYm9keS5maWx0ZXIoYiA9PiBiLnR5cGUgPT0gSEVBTCAmJiBiLmhpdHMgPiAwKS5sZW5ndGg7XG4gICAgICAgICAgICBjb25zdCBtZWxlZUFsbGllcyA9IENvbWJhdExpYnMubmVhcmJ5QWxsaWVkQ3JlZXBzKGNyZWVwLCAxKTtcbiAgICAgICAgICAgIGNvbnN0IGxvd2VzdEhlYWx0aE1lbGVlID0gQ29tYmF0TGlicy5sb3dlc3RIZWFsdGhDcmVlcChtZWxlZUFsbGllcywgaGVhbEJvZHlwYXJ0cyAqIDEyKTtcbiAgICAgICAgICAgIGlmIChsb3dlc3RIZWFsdGhNZWxlZSAhPSB1bmRlZmluZWQpIHsgLy8gTWVsZWUgaGVhbGluZyBpcyB0aGUgc3Ryb25nZXN0LiBUaGlzIHNob3VsZCBhdXRvbWF0aWNhbGx5IGhhbmRsZSBzZWxmIGhlYWxpbmcuXG4gICAgICAgICAgICAgICAgY3JlZXAuaGVhbChsb3dlc3RIZWFsdGhNZWxlZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJhbmdlZEFsbGllcyA9IENvbWJhdExpYnMubmVhcmJ5QWxsaWVkQ3JlZXBzKGNyZWVwKTsgLy8gUmFuZ2VkIGhlYWxpbmcgaXMgYSBiaXQgd2Vha2VyLlxuICAgICAgICAgICAgICAgIGNvbnN0IGxvd2VzdEhlYWx0aFJhbmdlZCA9IENvbWJhdExpYnMubG93ZXN0SGVhbHRoQ3JlZXAocmFuZ2VkQWxsaWVzLCBoZWFsQm9keXBhcnRzICogNCk7XG4gICAgICAgICAgICAgICAgaWYgKGxvd2VzdEhlYWx0aFJhbmdlZCAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlZXAucmFuZ2VkSGVhbChsb3dlc3RIZWFsdGhSYW5nZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChjcmVlcC5ib2R5LmZpbHRlcihiID0+IGIudHlwZSA9PSBBVFRBQ0sgJiYgYi5oaXRzID4gMCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0cyA9IENvbWJhdExpYnMubmVhcmJ5RW5lbXlDcmVlcHMoY3JlZXAsIDEpO1xuICAgICAgICAgICAgaWYgKHRhcmdldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IENvbWJhdExpYnMubG93ZXN0SGVhbHRoQ3JlZXAodGFyZ2V0cyk7XG4gICAgICAgICAgICAgICAgY3JlZXAuYXR0YWNrKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgZmlnaHRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNyZWVwLnRhcmdldEZsYWcgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY3JlZXAudGFyZ2V0RmxhZyA9IGZsYWdzW2NsYWltZWRGbGFnc11cbiAgICAgICAgICAgICAgICBjbGFpbWVkRmxhZ3MrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZmlnaHRpbmcpIHtcbiAgICAgICAgICAgIGNyZWVwLm1vdmVUbyhjcmVlcC50YXJnZXRGbGFnID09IHVuZGVmaW5lZCA/IGZsYWcgOiBjcmVlcC50YXJnZXRGbGFnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjcmVlcC5nZXRSYW5nZVRvKGNyZWVwLnRhcmdldEZsYWcgPT0gdW5kZWZpbmVkID8gZmxhZyA6IGNyZWVwLnRhcmdldEZsYWcpID4gMSkge1xuICAgICAgICAgICAgICAgIGNyZWVwLm1vdmVUbyhjcmVlcC50YXJnZXRGbGFnID09IHVuZGVmaW5lZCA/IGZsYWcgOiBjcmVlcC50YXJnZXRGbGFnKTsgLy8gVG9vIGZhciB0byBhY3RpdmF0ZSwgd2UgY2FuIGdldCBjbG9zZXIuXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBR0E7Ozs7QUFJRztNQUNVLFVBQVUsQ0FBQTtBQUVuQjs7OztBQUlHO0FBQ0gsSUFBQSxPQUFPLGlCQUFpQixHQUFBO0FBQ3BCLFFBQUEsTUFBTSxPQUFPLEdBQUcscUJBQXFCLENBQUMsS0FBSyxD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
