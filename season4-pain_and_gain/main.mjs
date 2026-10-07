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

function updateFlags() {
    getObjectsByPrototype(ScoreFlag);
}
function loop() {
    updateFlags();
    var flag = getObjectsByPrototype(ScoreFlag)[0];
    var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);
    for (var creep of myCreeps) {
        if (creep.body.filter(b => b.type == RANGED_ATTACK && b.hits > 0).length > 0) {
            const targets = CombatLibs.nearbyEnemyCreeps(creep);
            if (targets.length >= 3) {
                creep.rangedMassAttack(); // AOE is highest DPS here
            }
            else if (targets.length > 0) { // Execute lowest health first.
                const target = CombatLibs.lowestHealthCreep(targets);
                creep.rangedAttack(target);
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
        else if (creep.body.filter(b => b.type == ATTACK).length > 0) ;
        else ;
        creep.moveTo(flag);
    }
}

export { loop };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5tanMiLCJzb3VyY2VzIjpbIi4uL3NjcmVlcHMtZGV2L3NyYy9saWIvQ29tYmF0LnRzIiwiLi4vc2NyZWVwcy1kZXYvc3JjL2FyZW5hcy9zZWFzb240LXBhaW5fYW5kX2dhaW4vbWFpbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRPYmplY3RzQnlQcm90b3R5cGUsIGZpbmRJblJhbmdlIH0gZnJvbSAnZ2FtZS91dGlscyc7XG5pbXBvcnQgeyBDcmVlcCB9IGZyb20gJ2dhbWUvcHJvdG90eXBlcyc7XG5cbi8qKlxuICogTGliYXJpZXMgdXNlZCB0byBtYWtlIGNvbWJhdCBpbiBTY3JlZXBzQXJlbmEgc2ltcGxpZXIuXG4gKiBcbiAqIEBhdXRob3IgU3VnYWt1XG4gKi9cbmV4cG9ydCBjbGFzcyBDb21iYXRMaWJzIHtcblxuICAgIC8qKlxuICAgICAqIEEgcXVpY2sgc2hvcnRoYW5kIHdheSB0byByZWZlcmVuY2UgYWxsIGVuZW1pZXMgY3VycmVudGx5IHZpc2libGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgQ3JlZXBbXSBjb250YWlucyBhbGwgdmlzaWJsZSBlbmVtaWVzLiBJbiBhIG9uZSByb29tIHNjZW5hcmlvIHRoaXMgaXMgZXZlcnlvbmUuXG4gICAgICovXG4gICAgc3RhdGljIGdsb2JhbEVuZW15Q3JlZXBzICgpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgZW5lbWllcyA9IGdldE9iamVjdHNCeVByb3RvdHlwZShDcmVlcCkuZmlsdGVyKGMgPT4gIWMubXkpO1xuICAgICAgICByZXR1cm4gZW5lbWllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBIHF1aWNrIHNob3J0aGFuZCB3YXkgdG8gcmVmZXJlbmNlIGFsbCBhbGxpZXMgY3VycmVudGx5IHZpc2libGUuXG4gICAgICogXG4gICAgICogQHJldHVybnMgQ3JlZXBbXSBjb250YWlucyBhbGwgdmlzaWJsZSBjcmVlcHMuIFRoaXMgd2lsbCBhbHdheXMgYmUgYWxsIG93bmVkIGNyZWVwcy5cbiAgICAgKi9cbiAgICBzdGF0aWMgZ2xvYmFsQWxsaWVkQ3JlZXBzICgpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgYWxsaWVzID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKENyZWVwKS5maWx0ZXIoYyA9PiBjLm15KTtcbiAgICAgICAgcmV0dXJuIGFsbGllcztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBMb2NhdGVzIGVuZW1pZXMgbmVhciB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIHBvcyBUaGUgcG9zaXRpb24gdG8gY2hlY2sgYXJvdW5kLlxuICAgICAqIEBwYXJhbSBuZWFyIEhvdyBmYXIgaXMgY29uc2lkZXJlZCBuZWFyP1xuICAgICAqIEByZXR1cm5zIENyZWVwW10gLSBBIGxpc3Qgb2YgZW5lbWllcyB0aGF0IGFyZSBuZWFyYnkuXG4gICAgICovXG4gICAgc3RhdGljIG5lYXJieUVuZW15Q3JlZXBzIChwb3M6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIG5lYXI6IG51bWJlciA9IDMpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgZW5lbWllcyA9IHRoaXMuZ2xvYmFsRW5lbXlDcmVlcHMoKTtcbiAgICAgICAgcmV0dXJuIGZpbmRJblJhbmdlKHBvcywgZW5lbWllcywgbmVhcik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9jYXRlcyBhbGxpZXMgbmVhciB0aGUgZ2l2ZW4gcG9zaXRpb24uXG4gICAgICogXG4gICAgICogQHBhcmFtIHBvcyBUaGUgcG9zaXRpb24gdG8gY2hlY2sgYXJvdW5kLlxuICAgICAqIEBwYXJhbSBuZWFyIEhvdyBmYXIgaXMgY29uc2lkZXJlZCBuZWFyP1xuICAgICAqIEByZXR1cm5zIENyZWVwW10gLSBBIGxpc3Qgb2YgYWxsaWVzIHRoYXQgYXJlIG5lYXJieS5cbiAgICAgKi9cbiAgICBzdGF0aWMgbmVhcmJ5QWxsaWVkQ3JlZXBzIChwb3M6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIG5lYXI6IG51bWJlciA9IDMpOiBDcmVlcFtdIHtcbiAgICAgICAgY29uc3QgYWxsaWVzID0gdGhpcy5nbG9iYWxBbGxpZWRDcmVlcHMoKTtcbiAgICAgICAgcmV0dXJuIGZpbmRJblJhbmdlKHBvcywgYWxsaWVzLCBuZWFyKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHRoZSBsb3dlc3QgaGVhbHRoIGNyZWVwIGluIHRoZSBnaXZlbiBhcnJheS5cbiAgICAgKiBcbiAgICAgKiBAcGFyYW0gY3JlZXBzIFRoZSBsaXN0IG9mIGNyZWVwcyB0byBmaWx0ZXIgdGhyb3VnaC5cbiAgICAgKiBAcGFyYW0gbWluRGFtYWdlIFRoZSBtaW5pbXVtIGFtb3VudCBvZiBkYW1hZ2UgdGhhdCB0aGUgY3JlZXAgbXVzdCBoYXZlIGhhZC5cbiAgICAgKiBAcmV0dXJucyBDcmVlcCAtIFRoZSBsb3dlc3QgaGVhbHRoIHVuaXQuXG4gICAgICovXG4gICAgc3RhdGljIGxvd2VzdEhlYWx0aENyZWVwIChjcmVlcHM6IENyZWVwW10sIG1pbkRhbWFnZTogbnVtYmVyID0gMCk6IENyZWVwIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgaWYgKGNyZWVwcy5sZW5ndGggPT0gMCkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgdmFyIGxvd2VzdEhlYWx0aDogbnVtYmVyID0gLTE7XG4gICAgICAgIHZhciBsb3dlc3RJbmRleDogbnVtYmVyID0gLTE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3JlZXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY3JlZXBzW2ldLmhpdHMgPD0gY3JlZXBzW2ldLmhpdHNNYXggLSBtaW5EYW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBsb3dlc3RIZWFsdGggPSBjcmVlcHNbaV0uaGl0cztcbiAgICAgICAgICAgICAgICBsb3dlc3RJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGxvd2VzdEhlYWx0aCA9PSAtMSkgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgZm9yICh2YXIgaSA9IGxvd2VzdEluZGV4ICsgMTsgaSA8IGNyZWVwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGNyZWVwc1tpXSA9PSB1bmRlZmluZWQpIGNvbnRpbnVlO1xuICAgICAgICAgICAgaWYgKGNyZWVwc1tpXS5oaXRzIDwgbG93ZXN0SGVhbHRoKSB7XG4gICAgICAgICAgICAgICAgbG93ZXN0SGVhbHRoID0gY3JlZXBzW2ldLmhpdHM7XG4gICAgICAgICAgICAgICAgbG93ZXN0SW5kZXggPSBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjcmVlcHNbbG93ZXN0SW5kZXhdO1xuICAgIH1cbn07XG4iLCJpbXBvcnQgeyBnZXRPYmplY3RzQnlQcm90b3R5cGUgfSBmcm9tICdnYW1lL3V0aWxzJztcbmltcG9ydCB7IENyZWVwIH0gZnJvbSAnZ2FtZS9wcm90b3R5cGVzJztcbmltcG9ydCB7IFNjb3JlRmxhZyB9IGZyb20gJ2FyZW5hL3NlYXNvbl80L3BhaW5fYW5kX2dhaW4vYmFzaWMnO1xuaW1wb3J0IHsgQ29tYmF0TGlicyB9IGZyb20gJ0BsaWIvQ29tYmF0LmpzJztcbmltcG9ydCB7IFJBTkdFRF9BVFRBQ0ssIEFUVEFDSywgSEVBTCB9IGZyb20gJ2dhbWUvY29uc3RhbnRzJztcblxudmFyIGZsYWdzO1xuXG5mdW5jdGlvbiB1cGRhdGVGbGFncyAoKSB7XG4gICAgZmxhZ3MgPSBnZXRPYmplY3RzQnlQcm90b3R5cGUoU2NvcmVGbGFnKTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBsb29wICgpIHtcbiAgICB1cGRhdGVGbGFncygpO1xuICAgIHZhciBmbGFnID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKFNjb3JlRmxhZylbMF07XG4gICAgdmFyIG15Q3JlZXBzID0gZ2V0T2JqZWN0c0J5UHJvdG90eXBlKENyZWVwKS5maWx0ZXIob2JqZWN0ID0+IG9iamVjdC5teSk7XG4gICAgZm9yICh2YXIgY3JlZXAgb2YgbXlDcmVlcHMpIHtcblxuICAgICAgICBpZiAoY3JlZXAuYm9keS5maWx0ZXIoYiA9PiBiLnR5cGUgPT0gUkFOR0VEX0FUVEFDSyAmJiBiLmhpdHMgPiAwKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRzID0gQ29tYmF0TGlicy5uZWFyYnlFbmVteUNyZWVwcyhjcmVlcCk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0cy5sZW5ndGggPj0gMykge1xuICAgICAgICAgICAgICAgIGNyZWVwLnJhbmdlZE1hc3NBdHRhY2soKTsgLy8gQU9FIGlzIGhpZ2hlc3QgRFBTIGhlcmVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGFyZ2V0cy5sZW5ndGggPiAwKSB7IC8vIEV4ZWN1dGUgbG93ZXN0IGhlYWx0aCBmaXJzdC5cbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBDb21iYXRMaWJzLmxvd2VzdEhlYWx0aENyZWVwKHRhcmdldHMpO1xuICAgICAgICAgICAgICAgIGNyZWVwLnJhbmdlZEF0dGFjayh0YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGNyZWVwLmJvZHkuZmlsdGVyKGIgPT4gYi50eXBlID09IEhFQUwgJiYgYi5oaXRzID4gMCkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgY29uc3QgaGVhbEJvZHlwYXJ0cyA9IGNyZWVwLmJvZHkuZmlsdGVyKGIgPT4gYi50eXBlID09IEhFQUwgJiYgYi5oaXRzID4gMCkubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgbWVsZWVBbGxpZXMgPSBDb21iYXRMaWJzLm5lYXJieUFsbGllZENyZWVwcyhjcmVlcCwgMSk7XG4gICAgICAgICAgICBjb25zdCBsb3dlc3RIZWFsdGhNZWxlZSA9IENvbWJhdExpYnMubG93ZXN0SGVhbHRoQ3JlZXAobWVsZWVBbGxpZXMsIGhlYWxCb2R5cGFydHMgKiAxMik7XG4gICAgICAgICAgICBpZiAobG93ZXN0SGVhbHRoTWVsZWUgIT0gdW5kZWZpbmVkKSB7IC8vIE1lbGVlIGhlYWxpbmcgaXMgdGhlIHN0cm9uZ2VzdC4gVGhpcyBzaG91bGQgYXV0b21hdGljYWxseSBoYW5kbGUgc2VsZiBoZWFsaW5nLlxuICAgICAgICAgICAgICAgIGNyZWVwLmhlYWwobG93ZXN0SGVhbHRoTWVsZWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCByYW5nZWRBbGxpZXMgPSBDb21iYXRMaWJzLm5lYXJieUFsbGllZENyZWVwcyhjcmVlcCk7IC8vIFJhbmdlZCBoZWFsaW5nIGlzIGEgYml0IHdlYWtlci5cbiAgICAgICAgICAgICAgICBjb25zdCBsb3dlc3RIZWFsdGhSYW5nZWQgPSBDb21iYXRMaWJzLmxvd2VzdEhlYWx0aENyZWVwKHJhbmdlZEFsbGllcywgaGVhbEJvZHlwYXJ0cyAqIDQpO1xuICAgICAgICAgICAgICAgIGlmIChsb3dlc3RIZWFsdGhSYW5nZWQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNyZWVwLnJhbmdlZEhlYWwobG93ZXN0SGVhbHRoUmFuZ2VkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoY3JlZXAuYm9keS5maWx0ZXIoYiA9PiBiLnR5cGUgPT0gQVRUQUNLKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAvLyB0b2RvXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyB0b2RvOiBTY291dFxuICAgICAgICB9XG5cbiAgICAgICAgY3JlZXAubW92ZVRvKGZsYWcpO1xuICAgIH1cbn0iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFHQTs7OztBQUlHO01BQ1UsVUFBVSxDQUFBO0FBRW5COzs7O0FBSUc7QUFDSCxJQUFBLE9BQU8saUJBQWlCLEdBQUE7QUFDcEIsUUFBQSxNQUFNLE9BQU8sR0FBRyxxQkFBcUIsQ0FBQyxLQUFLLENBQUMsQ0FB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
