import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ScoreFlag } from 'arena/season_4/pain_and_gain/basic';
import { CombatLibs } from '@lib/Combat.js';
import { RANGED_ATTACK, ATTACK, HEAL } from 'game/constants';

declare module "game/prototypes/creep" {
    interface Creep {
        targetFlag?: ScoreFlag;
    } 
};

var flags: ScoreFlag[];
var fighting: boolean = false;
var claimedFlags: number = 1;

function updateFlags () {
    flags = getObjectsByPrototype(ScoreFlag);
};

export function loop () {
    updateFlags();
    fighting = false;
    var flag = getObjectsByPrototype(ScoreFlag)[0];
    var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);
    for (var creep of myCreeps) {

        if (creep.body.filter(b => b.type == RANGED_ATTACK && b.hits > 0).length > 0) {
            const targets: Creep[] = CombatLibs.nearbyEnemyCreeps(creep);
            if (targets.length >= 3) {
                creep.rangedMassAttack(); // AOE is highest DPS here
                fighting = true;
            } else if (targets.length > 0) { // Execute lowest health first.
                const target: Creep | undefined = CombatLibs.lowestHealthCreep(targets);
                if (target != undefined) {
                    creep.rangedAttack(target);
                    fighting = true;
                }
            }
        } else if (creep.body.filter(b => b.type == HEAL && b.hits > 0).length > 0) {
            const healBodyparts = creep.body.filter(b => b.type == HEAL && b.hits > 0).length;
            const meleeAllies = CombatLibs.nearbyAlliedCreeps(creep, 1);
            const lowestHealthMelee = CombatLibs.lowestHealthCreep(meleeAllies, healBodyparts * 12);
            if (lowestHealthMelee != undefined) { // Melee healing is the strongest. This should automatically handle self healing.
                creep.heal(lowestHealthMelee);
            } else {
                const rangedAllies = CombatLibs.nearbyAlliedCreeps(creep); // Ranged healing is a bit weaker.
                const lowestHealthRanged = CombatLibs.lowestHealthCreep(rangedAllies, healBodyparts * 4);
                if (lowestHealthRanged != undefined) {
                    creep.rangedHeal(lowestHealthRanged);
                }
            }
        } else if (creep.body.filter(b => b.type == ATTACK && b.hits > 0).length > 0) {
            const targets = CombatLibs.nearbyEnemyCreeps(creep, 1);
            if (targets.length > 0) {
                const target: Creep | undefined = CombatLibs.lowestHealthCreep(targets);
                if (target != undefined) creep.attack(target);
                fighting = true;
            }
        } else {
            if (creep.targetFlag == undefined) {
                creep.targetFlag = flags[claimedFlags]
                claimedFlags++;
            }
        }

        if (!fighting) {
            creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag);
        } else {
            if (creep.getRangeTo(creep.targetFlag == undefined ? flag : creep.targetFlag) > 1) {
                creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag); // Too far to activate, we can get closer.
            }
        }
    }
}