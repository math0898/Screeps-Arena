declare module "arena/season_4/pain_and_gain/basic/constants" {
    import {
        EFF_ATTACK_MODIFIER,
        EFF_DAMAGE_TAKEN_MODIFIER,
        EFF_HEAL_MODIFIER,
        EFF_RANGED_ATTACK_MODIFIER
    } from "game/constants";

    export type ScoreFlagEffectType =
        typeof EFF_ATTACK_MODIFIER |
        typeof EFF_DAMAGE_TAKEN_MODIFIER |
        typeof EFF_HEAL_MODIFIER |
        typeof EFF_RANGED_ATTACK_MODIFIER;

    export const TICKS_LIMIT = 2000;
    export const MAX_SCORE_PER_TICK = 25;
    export const FLAG_TYPES: Record<string, {
        readonly scorePerTick: number;
        readonly effectType: ScoreFlagEffectType;
    }>;
}
