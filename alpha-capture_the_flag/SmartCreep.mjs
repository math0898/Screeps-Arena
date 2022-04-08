/**
 * The super class for creep roles.
 * 
 * @author Sugaku
 */
export class SmartCreep {

    /**
     * Creates a new SmartCreep with the given creep.
     * 
     * @param c The creep to assign to this smart creep class.  
     */
    constructor (c) {
        this.creep = c;
    }

    /**
     * Runs the tick logic for this creep.
     */
    runLogic () {

    }
}
