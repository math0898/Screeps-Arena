import { getObjectsByPrototype } from 'game/utils';
import { Creep } from 'game/prototypes';
import { ScoreFlag } from 'arena/season_4/pain_and_gain/basic';
import { CombatLibs } from '@lib/Combat.js';
import { RANGED_ATTACK, ATTACK, HEAL, TOP } from 'game/constants';

declare module "game/prototypes/creep" {
    interface Creep {
        targetFlag?: ScoreFlag;
    } 
};

var flags: ScoreFlag[];
var fighting: boolean = false;
var combat: boolean = false;
var claimedFlags: number = 1;

function updateFlags () {
    flags = getObjectsByPrototype(ScoreFlag);
};

export function loop () {
    updateFlags();
    if (combat == false) fighting = false;
    else fighting = true;
    var flag = getObjectsByPrototype(ScoreFlag)[0];
    var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);
    for (var creep of myCreeps) {

        if (creep.body.filter(b => b.type == RANGED_ATTACK && b.hits > 0).length > 0) {
            creep.rangedMassAttack(); // Default to an AOE attack, it hits enemies which move into range, and can be done while moving.
            const targets: Creep[] = CombatLibs.nearbyEnemyCreeps(creep);
            if (targets.length >= 3) {
                creep.rangedMassAttack(); // AOE is highest DPS here
                combat = true;
            } else if (targets.length > 0) { // Execute lowest health first.
                const target: Creep | undefined = CombatLibs.lowestHealthCreep(targets);
                if (target != undefined) {
                    creep.rangedAttack(target);
                    combat = true;
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
                    creep.moveTo(lowestHealthRanged); // We move closer so we can eventually melee heal them.
                }
            }
        } else if (creep.body.filter(b => b.type == ATTACK && b.hits > 0).length > 0) {
            const targets = CombatLibs.nearbyEnemyCreeps(creep, 1);
            if (targets.length > 0) {
                const target: Creep | undefined = CombatLibs.lowestHealthCreep(targets);
                if (target != undefined) creep.attack(target);
                combat = true;
            }
        } else {
            if (creep.targetFlag == undefined) {
                creep.targetFlag = flags[claimedFlags]
                claimedFlags++;
            }
        }

        // TODO: Assign target flags to fighting units when no more enemy combat creeps are detected.
        if (creep.getRangeTo(creep.targetFlag == undefined ? flag : creep.targetFlag) > 2) {
            creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag);
        } else {
            const difX: number = creep.x - (creep.targetFlag == undefined ? flag : creep.targetFlag).x;
            const difY: number = creep.y - (creep.targetFlag == undefined ? flag : creep.targetFlag).y;
            if (fighting && difX <= 1 && difY <= 1) { // TODO: Make this a little more logical, move away, not up.
                creep.move(TOP); // Move off the flag if we're on it and in combat. 
            } else {
                creep.moveTo(creep.targetFlag == undefined ? flag : creep.targetFlag);
            }
        }
    }
}