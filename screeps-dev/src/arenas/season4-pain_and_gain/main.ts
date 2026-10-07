import {getObjectsByPrototype} from 'game/utils';
import {Creep} from 'game/prototypes';
import {ScoreFlag} from 'arena/season_4/pain_and_gain/basic';

export function loop() {
    var flag = getObjectsByPrototype(ScoreFlag)[0];
    var myCreeps = getObjectsByPrototype(Creep).filter(object => object.my);
    for(var creep of myCreeps) {
        creep.moveTo(flag);
    }
}