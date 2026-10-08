declare module "game/prototypes/container" {

    import { Store } from "game/prototypes/store";
    import { OwnedStructure } from "game/prototypes/owned-structure";

    /**
     * A small container that can be used to store resources.
     * This is a walkable structure.
     * All dropped resources automatically goes to the container at the same tile.
     */
    export class StructureContainer extends OwnedStructure {
        /** A {@link Store} object that contains cargo of this structure. */
        store: Store;
    }
}
