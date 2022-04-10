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

function turtle () {
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);
    var targetPositions;
    if (myFlag.x < 10) targetPositions = [
        {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 3, y: 1}, {x: 3, y: 2}, {x: 2, y: 3}, // Healer positions
        {x: 2, y: 1}, {x: 4, y: 1}, {x: 4, y: 3}, {x: 4, y: 4}, {x: 3, y: 4}, {x: 1, y: 4}, // Ranger positions
        {x: 2, y: 2}, {x: 3, y: 3} // Meele positions
    ]; else targetPositions = [
        {x: 97, y: 94}, {x: 97, y: 96}, {x: 96, y: 95}, {x: 95, y: 96}, {x: 96, y: 97}, {x: 94, y: 97}, // Healer positions
        {x: 94, y: 94}, {x: 95, y: 94}, {x: 94, y: 95}, {x: 96, Y: 94}, {x: 94, y: 96}, {x: 97, y: 97}, // Ranger positions
        {x: 96, y: 96}, {x: 95, y: 95} // Meele positions
    ];
    var i = 0; 
    for (var c of creeps) {
        c.setTurtle(targetPositions[i]);
        i++;
    }
}

function init () {

    var melees = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == ATTACK) && c.my);
    var ranged = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == RANGED_ATTACK) && c.my);
    var healers = getObjectsByPrototype(Creep).filter(c => c.body.some(body => body.type == HEAL) && c.my);
    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);

    for (var h of healers) creeps.push(new Healer(h, myFlag, enemyFlag));
    for (var r of ranged) creeps.push(new Ranger(r, myFlag, enemyFlag));
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

    creeps = creeps.filter(c => c.creep.body != undefined);

    const tick = getTicks();

    var enemies = getObjectsByPrototype(Creep).filter(c => !c.my);
    var allies = getObjectsByPrototype(Creep).filter(c => c.my);
    var towers = getObjectsByPrototype(StructureTower).filter(t => t.my);
    const enemyFlag = getObjectsByPrototype(Flag).find(f => !f.my);
    const myFlag = getObjectsByPrototype(Flag).find(f => f.my);

    if (tick == 1) {
        console.log("Switching to full turtle.");
        init();
        mode = 'turtle';
        for (var c of creeps) c.setMode('turtle');
        turtle();
    } else if (tick == 1000) {
        mode = 'defend';
        console.log('Switching to defense.');
        for (var c of creeps) c.setMode('defend');
    } else if (mode == 'attack' && findInRange(enemyFlag, getObjectsByPrototype(Creep).filter(c => !c.my), 20).length == 0) {
        console.log("Enemy flag left undefended. Sending rush.");
        for (var c of creeps) if (c.creep.body.some(body => body.type == HEAL)) c.setMode('rush');
    } else if (getObjectsByPrototype(Creep).filter(c => c.my && c.body.some(body => body.type != MOVE && body.type != HEAL)) < 1 && mode != 'rush') {
        mode = 'rush';
        console.log('Switching to rush.');
        for (var c of creeps) c.setMode('rush');
    } else if (tick == 1500 || enemies.length == 0 && mode != 'attack') {
        mode = 'attack';
        console.log('Switching to attack.');
        for (var c of creeps) c.setMode('attack');
    }

    if (mode == 'defend' || mode == 'turtle') enemies = findInRange(myFlag, enemies, 10);

    for (var c of creeps) c.runLogic(enemies, allies);
    for (var t of towers) towerTime(t);
}
