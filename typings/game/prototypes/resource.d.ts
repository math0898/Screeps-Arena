declare module "game/prototypes/resource" {

    import { GameObject } from "game/prototypes/game-object";

    type ResourceType = string; // TODO: develop resource type

    /** A dropped piece of resource. Dropped resource pile decays for ceil(amount/1000) units per tick */
    export class Resource extends GameObject {
        /** The amount of dropped resource */
        amount: number;

        /** The type of dropped resource (one of RESOURCE_* constants) */
        resourceType: ResourceType;
    }
}
