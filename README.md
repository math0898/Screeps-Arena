# Screeps Arena

## Season 04

### Pain and Gain
I've kept the strategy very simple, rush the middle. Combat is currently extremely elementry. Units simply pick the best action (ranged attack lowest health / mass attack), and do no movement. There's a combat check to avoid stepping on a flag while fighting is still occuring. The two scout units (determined by no combat parts), pick 2 flags and rush to them. These happen to be the ones on the far corners of the arena. 

### Spawn and Swamp
My strategy is to spawn a big attack creep to down the nearby wall to get access to the container. Then we spawn 2 carry creeps to ferry resources to our spawn. Then we spam spawn little 1 attack, 1 move creeps (I suspect 1 ranged, 1 move will be better with good combat kiting code). All attack units follow a simple priority.
1. Nearby enemies (3). - Make sure to hit anyone if able, move towards lowest health enemy. 
2. Near wall if alive.
3. Enemy spawn.

### Escort Run
The escort run gamemode is a gamemode where the user is given a spawn, 500 energy, and an escort creep to get to their flag on the other side of the map. My baseline strategy is to defend the middle of the map and have the escort run as much as possible. After the middle has been secured for long enough, then units switch to an offensive mode to attack the opponent's escort. 

- When macro is detected, a tug creep is spawned to pull the escort faster. The idea is its better to win quickly rather than enter a large scale macro battle where I need to trade efficiently. The tug has a single attack bodypart in hopes to fend off early macro attackers, this is a WIP and doesn't succeed always.
