import { getObjectsByPrototype, findInRange } from '/game/utils';
import { Creep, Flag, StructureTower } from '/game/prototypes';
import { ERR_NOT_IN_RANGE, ATTACK, RANGED_ATTACK, HEAL, MOVE, OK } from '/game/constants';
import { } from '/arena';
import { getTicks } from '/game';
import { Ranger } from "./Ranger.mjs";
import { Healer } from './Healer.mjs';

function meleeDefense (c, enemies) {
    const target = c.findClosestByPath(enemies);
    if (c.attack(target) == ERR_NOT_IN_RANGE) c.moveTo(target);
}

function meleeRush (c, enemies, enemyFlag) {
    const target = c.findClosestByPath(enemies);
    if (c.attack(target) == ERR_NOT_IN_RANGE) c.moveTo(target);

    if (enemies.length == 0) c.moveTo(enemyFlag);
}

function towerTime (t) {
    const heal = t.findClosestByRange(getObjectsByPrototype(Creep).filter(c => c.my && c.hits < c.hitsMax));
    if (heal != null) t.heal(heal);
    else {
        var target = t.findClosestByRange(getObjectsByPrototype(Creep).filter(c => !c.my && c.body.some(b => b.type == HEAL)));
        if (target != null) t.attack(target);
        else {
            var targets = findInRange(t, getObjectsByPrototype(Creep).filter(c => !c.my), 10);
            target = t.findClosestByRange(targets);
            t.attack(target);
        }
    }
}

var creeps = new Array();
var mode = 'defened';

export function loop () {

    const tick = getTicks();

    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);
    var enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
    var allies = getObjectsByPrototype(Creep).filter(c => c.my);
    var melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
    var ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
    var healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);
    var towers = getObjectsByPrototype(StructureTower).filter(t => t.my);

    if (melees.length + ranged.length < 1 && mode != 'rush') {
        mode = 'rush';
        console.log('Switching to rush.');
        for (var c of creeps) c.setMode('rush');
    }

    if (tick == 1) {
        for (var r of ranged) creeps.push(new Ranger(r, myFlag, enemyFlag));
        for (var h of healers) creeps.push(new Healer(h, myFlag, enemyFlag));
    }

    if (tick >= 500) {
        if (tick == 500) console.log('Switching to attack.');
        for (var m of melees) meleeRush(m, enemies, enemyFlag);
        for (var c of creeps) c.runLogic(enemies, allies);
    } else if (tick < 60) { // TODO: create a defensive formation around flag.
        for (var h of healers) h.moveTo(myFlag);
        for (var r of ranged) r.moveTo(myFlag);
        for (var m of melees) m.moveTo(myFlag);
    } else {
        enemies = findInRange(myFlag, enemies, 10);
        if (tick == 61) console.log('Starting with Defense');
        for (var m of melees) meleeDefense(m, enemies);
        for (var r of creeps) r.runLogic(enemies, allies);
    }

    for (var t of towers) towerTime(t);
}
