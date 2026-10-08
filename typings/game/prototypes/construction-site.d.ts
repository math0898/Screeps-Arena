declare module "game/prototypes/construction-site" {
    
    import { Structure } from "game/prototypes/structure";
    import { GameObject } from "game/prototypes/game-object";

    /**
     * A site of a structure which is currently under construction
     */
    export class ConstructionSite extends GameObject {
        /** The current construction progress */
        readonly progress?: number;

        /** The total construction progress needed for the structure to be built */
        readonly progressTotal?: number;

        /** The structure that will be built (when the construction site is completed) */
        readonly structure?: Structure;

        /** Whether it is your construction site */
        readonly my?: boolean;

        /**
         * Remove this construction site
         */
        remove(): void;
    }
}
