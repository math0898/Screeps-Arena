import { getObjectsByPrototype, findInRange } from '/game/utils';
import { Creep, Flag, StructureTower } from '/game/prototypes';
import { ATTACK, RANGED_ATTACK, HEAL, MOVE } from '/game/constants';
import { } from '/arena';
import { getTicks } from '/game';
import { Ranger } from "./Ranger.mjs";
import { Healer } from './Healer.mjs';
import { Melee } from './Melee.mjs';

var creeps = new Array();
var mode = 'defend';

function init () {

    var melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
    var ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
    var healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);
    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);

    for (var r of ranged) creeps.push(new Ranger(r, myFlag, enemyFlag));
    for (var h of healers) creeps.push(new Healer(h, myFlag, enemyFlag));
    for (var m of melees) creeps.push(new Melee(m, myFlag, enemyFlag));
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

export function loop () { // todo anti-turtle strategy

    const tick = getTicks();

    var enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
    var allies = getObjectsByPrototype(Creep).filter(c => c.my);
    var towers = getObjectsByPrototype(StructureTower).filter(t => t.my);
    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);

    if (tick == 1) init();
    else if (tick == 60) {
        mode = 'defend';
        console.log('Switching to defense.');
        for (var c of creeps) c.setMode('defend');
    } else if (tick == 1500 || enemies.length == 0 && mode != 'attack') {
        mode = 'attack';
        console.log('Switching to attack.');
        for (var c of creeps) c.setMode('attack');
    }

    if (getObjectsByPrototype(Creep).filter(c => c.my && c.body.some(body => body.type != MOVE && body.type != HEAL)) < 1 && mode != 'rush') {
        mode = 'rush';
        console.log('Switching to rush.');
        for (var c of creeps) c.setMode('rush');
    }

    if (tick < 60) { // TODO: create a defensive formation around flag.

        const melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
        const ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
        const healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);

        for (var h of healers) h.moveTo(myFlag);
        for (var r of ranged) r.moveTo(myFlag);
        for (var m of melees) m.moveTo(myFlag);
    }

    if (mode == 'defend') enemies = findInRange(myFlag, enemies, 10);

    if (tick >= 60) {
        for (var c of creeps) c.runLogic(enemies, allies);
        for (var t of towers) towerTime(t);
    }
}
