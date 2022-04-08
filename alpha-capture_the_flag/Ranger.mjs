import { SmartCreep } from "./SmartCreep.mjs";

/**
 * The ranger class is for creeps who fill the ranger role.
 * 
 * @author Sugaku
 */
export class Ranger extends SmartCreep {

    /**
     * Hello world method for a multiple files.
     */
    hello_world () {
        console.log('hello world!');
        console.log(this.creep);
    }

    /**
     * Runs the logic for this creep.
     */
    runLogic () {
        console.log('rangers are noisy');
    }
}
