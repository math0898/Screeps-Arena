declare module "game/prototypes/extension" {

    import { Store } from "game/prototypes/store";
    import { OwnedStructure } from "game/prototypes/owned-structure";

    /** Contains energy that can be spent on spawning bigger creeps */
    export class StructureExtension extends OwnedStructure {
        /** A {@link Store} object that contains cargo of this structure. */
        store: Store;
    }
}
