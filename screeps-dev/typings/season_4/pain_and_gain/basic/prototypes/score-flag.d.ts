declare module "arena/season_4/pain_and_gain/basic/prototypes" {
    import { Flag } from "game/prototypes";
    import { ScoreFlagEffectType } from "arena/season_4/pain_and_gain/basic/constants";

    /** An instantly captured flag that scores points at the cost of a global debuff. */
    export class ScoreFlag extends Flag {
        /** The global effect applied while this flag is controlled. */
        readonly effectType: ScoreFlagEffectType;
        /** Score awarded to the owner each tick. */
        readonly scorePerTick: number;
    }
}
