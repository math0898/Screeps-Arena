declare module "game/prototypes/structure" {

    import { GameObject } from "game/prototypes/game-object";

    /** The base prototype object of all structures. */
    export class Structure extends GameObject {
        /** The current amount of hit points of the structure */
        readonly hits?: number;

        /** The maximum amount of hit points of the structure */
        readonly hitsMax?: number;
    }
}