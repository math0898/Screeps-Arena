# Versions (Season 4 - Pain and Gain)

## v3 (Estimated: 480 MMR, Rank #45)

- Healers now move closer to targets they've ranged heal.
- Ranged now mass attack by default on movement.
- Creeps now move off flags if combat is detected.
- Fixed combat detection bug.

Tested against:
- Idle Opponent: ✅
- MBFishhh v146: ❌
- temik911 v10: ❌
- DillyDally v17: ❌
- temik911 v67: ❌

## v2 (Estimated: 475 MMR, Rank #45)

- Implemented basic combat code, attack enemies that are nearby.
  - Melee in range
  - Ranged
    - If enemies > 3 mass attack
    - Otherwise single hit, lowest health.
  - Healer
    - Heal lowest health in melee range
    - Heal lowest health in range
- Scouts pick a flag and go.
- Do not step on flag if fighting is active.

Tested against:
- Idle Opponent: ✅
- OoPaul v1: ✅
- Katterton v2: ✅
- Geofence v10: ✅
- Katterton v16: ✅

## v1 (Estimated: 8 MMR, Rank #64)

Default example code. Can beat idle opponent, and not much else.
