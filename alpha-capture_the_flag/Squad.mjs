import { Creep } from "game/prototypes";
import { getObjectsByPrototype } from "game/utils";

/**
 * 
 * @param {Creep} healer1 
 * @param {Creep} healer2 
 * @param {Creep} ranger1 
 * @param {Creep} ranger2 
 */
export function Squad (healer1, healer2, ranger1, ranger2) {
    this.healers = [];
    this.healers.push(healer1);
    this.healers.push(healer2);
    this.rangers = [];
    this.rangers.push(ranger1);
    this.rangers.push(ranger2);
}

Squad.prototype.costMatrix = undefined;

Squad.prototype.setCostMatrix = function (matrix) {
    this.costMatrix = matrix;
};

Squad.prototype.merge = function (mergeTo) { // TODO: Generalize, might need to consider dead creeps.
    this.healers[0].moveTo({x: mergeTo.x - 1, y: mergeTo.y - 1});
    this.healers[1].moveTo({x: mergeTo.x, y: mergeTo.y - 1});
    this.rangers[1].moveTo({x: mergeTo.x - 1, y: mergeTo.y});
};

Squad.prototype.isMerged = function () {
    var outOfFormation = false;
    const target = { x: this.rangers[0].x, y: this.rangers[0].y }; // TODO: This might need to be generalized, consider dead creeps.
    for (let i in this.healers) if (Math.abs(this.healers[i].x - target.x) > 1 || Math.abs(this.healers[i].y - target.y) > 1) outOfFormation = true;
    for (let i in this.rangers) if (Math.abs(this.rangers[i].x - target.x) > 1 || Math.abs(this.rangers[i].y - target.y) > 1) outOfFormation = true;
    return !outOfFormation;
};

Squad.prototype.move = function (dir) { // TODO: Fatigue Check
    for (let i in this.healers) this.healers[i].move(dir);
    for (let i in this.rangers) this.rangers[i].move(dir);
};

Squad.prototype.moveTo = function (pos, checkMerged = true) {
    if (checkMerged) {
        if (!this.isMerged()) {
            this.merge(this.rangers[0]);
            return;
        }
    }
    const arr = this.rangers[0].findPathTo(pos, { costMatrix: this.costMatrix });
    var dir;
    if (arr[0].x == this.rangers[0].x) { // Vertical
        if (arr[0].y < this.rangers[0].y) this.move(1);
        else this.move(5);
        return;
    } else if (arr[0].x == this.rangers[0].x + 1) dir = 3; // Right
    else dir = -7; // Left
    
    if (arr[0].y < this.rangers[0].y) dir -= 1;
    else if (arr[0].y > this.rangers[0].y) dir += 1;
    if (dir < 0) dir *= -1;
    this.move(dir);
};

Squad.prototype.logic = function () {
    const enemies = getObjectsByPrototype(Creep).filter((c) => !c.my);
    const inRangeEnemies = this.rangers[0].findInRange(enemies, 4);
    if (inRangeEnemies.length > 3) for (let c in this.rangers) this.rangers[c].rangedMassAttack(); // TODO: Little more nuance needed
    else if (inRangeEnemies.length > 0) for (let c in this.rangers) this.rangers[c].rangedAttack(inRangeEnemies[0]); // TODO: Lowest Health or healers
    var lowest = this.rangers[0];
    if (this.rangers[1].hits < lowest.hits) lowest = this.rangers[1];
    for (let i in this.healers) if (this.healers[i].hits < lowest.hits) lowest = this.healers[i];
    for (let i in this.healers) this.healers[i].heal(lowest);
};
