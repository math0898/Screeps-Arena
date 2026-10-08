declare module "game/prototypes/owned-structure" {

    import { Structure } from "game/prototypes/structure";

    /** The base prototype for a structure that has an owner */
    export abstract class OwnedStructure extends Structure {

        /** true for your structure, false for a hostile structure, undefined for a neutral structure */
        readonly my?: boolean;
    }
}
