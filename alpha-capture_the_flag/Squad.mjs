import { Creep } from "game/prototypes";

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

Squad.prototype.move = function (dir) { // TODO: Fatigue Check
    for (let i in this.healers) this.healers[i].move(dir);
    for (let i in this.rangers) this.rangers[i].move(dir);
};

Squad.prototype.moveTo = function (pos) { // TODO: Cost matrix 2x2
    const arr = this.rangers[0].findPathTo(pos);
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
