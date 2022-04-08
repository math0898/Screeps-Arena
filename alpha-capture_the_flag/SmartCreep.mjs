/**
 * The super class for creep roles.
 * 
 * @author Sugaku
 */
export class SmartCreep {

    /**
     * Creates a new SmartCreep with the given creep.
     * 
     * @param creep     The creep to assign to this smart creep class.  
     * @param myFlag    Reference to the my flag which needsto be defeneded.
     * @param enemyFlag The enemy flag to try and capture to win the round.
     */
    constructor (creep, myFlag, enemyFlag) {
        this.creep = creep;
        this.myFlag = myFlag;
        this.enemyFlag = enemyFlag;
    }

    /**
     * Runs the tick logic for this creep.
     * 
     * @param enemies The current enemies still alive.
     * @param allies  The current allies still alive.
     */
    runLogic (enemies, allies) {

    }
}
