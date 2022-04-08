import { getObjectsByPrototype } from '/game/utils';
import { Creep, Flag, StructureTower } from '/game/prototypes';
import { ERR_NOT_IN_RANGE, ATTACK, RANGED_ATTACK, HEAL } from '/game/constants';
import { } from '/arena';



function meleeRole (c, enemies, enemyFlag) {
    const target = c.findClosestByPath(enemies);
    if (c.attack(target) == ERR_NOT_IN_RANGE) c.moveTo(target);

    if (enemies.length == 0) c.moveTo(enemyFlag);
}

function rangedRole (r, enemies, enemyFlag) {
    const target = r.findClosestByPath(enemies);
    if (r.rangedAttack(target) == ERR_NOT_IN_RANGE) r.moveTo(target);
    else r.rangedMassAttack();

    if (enemies.length == 0) r.moveTo(enemyFlag);
}

function healerRole (h) {
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
            target = t.findClosestByRange(getObjectsByPrototype(Creep).filter(c => !c.my));
            t.attack(target);
        }
    }
}

export function loop () {

    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);

    var enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
    var melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
    var ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
    var healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);
    var towers = getObjectsByPrototype(StructureTower).filter(t => t.my);

    for (var m of melees) meleeRole(m, enemies, enemyFlag);
    for (var r of ranged) rangedRole(r, enemies, enemyFlag);
    for (var h of healers) healerRole(h);
    for (var t of towers) towerTime(t);
}
