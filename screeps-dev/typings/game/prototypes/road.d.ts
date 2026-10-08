declare module "game/prototypes/road" {

    import { Structure } from "game/prototypes/structure";

    /** Decreases movement cost to 1. Using roads allows creating creeps with less MOVE body parts */
    export class StructureRoad extends Structure {
    }
}
