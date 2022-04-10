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
     * @param myFlag    Reference to the my flag which needs to be defended.
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

    /**
     * Sets the logic mode of this smart creep.
     * 
     * @param {string} mode The new mode to put this creep into.
     */
    setMode (mode) {
        this.mode = mode;
    }

    /**
     * Sets the turtle position for this creep.
     * 
     * @param {pos} pos The turtle position for this creep.
     */
    setTurtle (pos) {
        this.turtlePos = pos;
    }

    /**
     * Makes this creep move to their turtle position.
     */
    moveToTurtle () {
        if (this.creep.x != this.turtlePos.x || this.creep.y != this.turtlePos.y) this.creep.moveTo(this.turtlePos);
    }
}
