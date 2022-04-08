import { getObjectsByPrototype, findInRange } from '/game/utils';
import { Creep, Flag, StructureTower } from '/game/prototypes';
import { ERR_NOT_IN_RANGE, ATTACK, RANGED_ATTACK, HEAL, OK } from '/game/constants';
import { } from '/arena';
import { getTicks } from '/game';

function meleeDefense (c, enemies) {
    const target = c.findClosestByPath(enemies);
    if (c.attack(target) == ERR_NOT_IN_RANGE) c.moveTo(target);
}

function rangedDefense (r, enemies, myFlag) {
    const target = myFlag.findClosestByRange(enemies);
    const inRange = findInRange(r, enemies, 3);
    const inFlagRange = findInRange(myFlag, enemies, 2);
    if (inRange.length < 3 || inFlagRange.length == 1) {
        if (r.rangedAttack(target) == ERR_NOT_IN_RANGE) r.moveTo(target);
    } else r.rangedMassAttack();
}

function meleeRush (c, enemies, enemyFlag) {
    const target = c.findClosestByPath(enemies);
    if (c.attack(target) == ERR_NOT_IN_RANGE) c.moveTo(target);

    if (enemies.length == 0) c.moveTo(enemyFlag);
}

function rangedRush (r, enemies, enemyFlag) {
    const target = r.findClosestByPath(enemies);
    const inRange = findInRange(r, enemies, 3);
    if (inRange < 3) {
        if (r.rangedAttack(target) == ERR_NOT_IN_RANGE) r.moveTo(target);
    } else r.rangedMassAttack();

    if (enemies.length == 0) r.moveTo(enemyFlag);
}

function healerRush (h) {
    var target = h.findClosestByPath(getObjectsByPrototype(Creep).filter(c => c.my && c.hits < c.hitsMax));
    if (target == null || target == undefined) target = h.findClosestByPath(getObjectsByPrototype(Creep).filter(c => c.my && c.body.some(body => body.type == ATTACK)));
    if (h.rangedHeal(target)) h.moveTo(target);
}

function towerTime (t) {
    const heal = t.findClosestByRange(getObjectsByPrototype(Creep).filter(c => c.my && c.hits < c.hitsMax));
    if (heal != null) t.heal(heal);
    else {
        var target = t.findClosestByRange(getObjectsByPrototype(Creep).filter(c => !c.my && c.body.some(b => b.type == HEAL)));
        if (target != null) t.attack(target);
        else {
            var targets = inRange(t, getObjectsByPrototype(Creep).filter(c => !c.my), 10);
            target = t.findClosestByRange(targets);
            t.attack(target);
        }
    }
}

export function loop () {

    const tick = getTicks();

    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);
    var enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
    var melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
    var ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
    var healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);
    var towers = getObjectsByPrototype(StructureTower).filter(t => t.my);

    if (tick >= 500) {
        if (tick == 500) console.log('Switching to Rush');
        for (var m of melees) meleeRush(m, enemies, enemyFlag);
        for (var r of ranged) rangedRush(r, enemies, enemyFlag);
        for (var h of healers) healerRush(h);
    } else if (tick < 20) {
        for (var h of healers) h.moveTo(myFlag);
        for (var r of ranged) r.moveTo(myFlag);
        for (var m of healers) m.moveTo(myFlag);
    } else {
        enemies = findInRange(myFlag, enemies, 10);
        if (tick == 21) console.log('Starting with Defense');
        for (var m of melees) meleeDefense(m, enemies);
        for (var r of ranged) rangedDefense(r, enemies, myFlag);
        for (var h of healers) healerRush(h);
    }

    for (var t of towers) towerTime(t);
}
