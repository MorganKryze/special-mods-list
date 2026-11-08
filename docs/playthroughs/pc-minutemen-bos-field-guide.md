# Field guide: what the PC playthrough changes for the player

A spoiler-free sheet for the [Minutemen and Brotherhood PC playthrough](pc-minutemen-bos.md): what behaves differently from the vanilla game, what you have to do yourself, and where the new content starts when its start is part of the mod's own description. Stories, rewards and endings are left out on purpose.

## First things to know

| Change | What it means in play | Mods |
| --- | --- | --- |
| Rebalance | Very Hard is the intended difficulty. Guns, armour, perks, loot and enemies are reworked; pre-war guns are rarer and stronger | Lunar Fallout Overhaul, Lunar Fallout Arsenal |
| Survival-lite | Hunger, thirst, sleep, hygiene, disease and wounds on a normal difficulty, with free saving | Advanced Needs 76 |
| Sleeping away from beds | Tents, bedrolls, a fire and a cooking pot you carry | Campsite |
| Waiting | An item lets you wait anywhere | Simple Wait Anywhere |
| Busier world | Many more random encounters, travellers, traders and patrols; corpses placed in dungeons are alive; dungeons call reinforcements and hit squads may follow | Commonwealth Encounter Pack, NPCs Travel, Starts Dead Alive, Reinforcements and Retribution, Story Encounter Booster |
| Cleared places stay cleared longer | Normal cells respawn after a week, cleared cells after about four months | Longer Area Respawn |
| Smarter enemies | Accuracy by archetype, suppression, cover-to-cover moves, retreats; NPCs only throw the grenades they carry | Adaptive Combat Tactics, Reduce Grenade Spam |
| Explosive props | Shooting explosive items or ammo makes them blow up | Hit Those Explosives |
| Companions | Dogmeat plus one companion at the same time; companions never use ammo (they need one round of the weapon) | Simple Everyone's Best Friend, Infinite Companion Ammo |
| Compass | Enemies show on the compass as in Fallout 3 and New Vegas, depending on Perception. Friendly markers are switched off on purpose (they showed allies in red) | Friendly NPCs On Compass |

## Settings to check once

Open **Pause menu → Mod Config** (MCM). Pages worth a look:

- **Advanced Needs 76**: which needs are active.
- **Sim Settlements 2**: settlement and story options.
- **NPCs Travel**, **Inertia**, **Simple Wait Anywhere**: their own pages.
- Interface: FallUI (HUD, inventory, map, workbench), Immersive HUD, FOV Slider and Player Height.

Photo mode, Get Out Of My Face (push an NPC blocking a door) and Rename Anything run from keys or menus listed on their MCM pages.

## Settlements

| What | What to do | Mods |
| --- | --- | --- |
| Sim Settlements 2 | Settlers build on plots you place; its story runs alongside the main quest. Each vanilla and DLC settlement can take a ready-made City Plan, which builds the whole town and levels it up | Sim Settlements 2, Rise of the Commonwealth, SS2 Settlers UI |
| More to build | SS2's 10,000-object kit, snap-together cabins, canopies, snappy walls and crops, sandbags, longer power wires | Wasteland Reconstruction Kit, A Better World, Al's Canopies, Extra Snappy, Sandbag Fortifications, Longer Power Lines |
| Free placement | Objects can be placed anywhere, clipping included | Place Everywhere |
| Attacks | Attackers spawn outside the walls instead of inside | Edmond's Settlement Attack Spawns Outside |
| Supply lines | Provisioners can be rerouted and tracked from a menu; they travel with their weapons drawn | Provisioner and Supply Line Management System, Open Carry Provisioners |
| Life in town | Settlers go shopping, sit on furniture with props, and say more varied lines | Settlers Go Shopping, Dynamic Furniture, Settler and Companion Dialogue Overhaul |

### Cleaning a settlement

There is no "scrap everything" mod in this list, on purpose:

- Scrap Everything and Spring Cleaning let you scrap the precombined objects (the buildings and debris the game draws as one block). Scrapping one turns off precombined drawing for that cell: frame rate drops there. The Sim Settlements 2 wiki also lists them as known issues: they allow more scrapping than SS2 handles reliably.
- Clean My Settlement REDUX (the cleanup mod the SS2 wiki names as safe) was checked on 2026-11-08 and not added: its plugin edits 2,751 Commonwealth cells and places 75,328 objects in them, which overlaps the playthrough's whole load order previs patch, and its author asks for a new game.
- MS Raze my Settlement needs SUP F4SE, whose last build (11.70, 2024-03-07) predates game 1.11.240.

What works instead:

- A City Plan from Rise of the Commonwealth sets up the whole settlement for you.
- In workshop mode, everything highlighted as scrappable can be scrapped as usual.
- With Place Everywhere, **never move or scrap the objects it highlights in yellow**: they are precombined, and touching them breaks the cell's precombines like Scrap Everything would.

## Minutemen

| What changes | How it starts | Mods |
| --- | --- | --- |
| Preston's settlement quests | They come when you ask Preston "How are you doing?" instead of after every report | Who's The General |
| Ranks, dragoons in T-45, legendary Minutemen, faction perks, assault encounters | During Minutemen progress | Improved Minutemen |
| Recruitable Minutemen | 18 unique settlers to recruit | At A Minute's Notice |
| Captured Minutemen and settlers | Held at raider and mutant camps; you can free them | Minutemen Captives |
| Small Minutemen locations, patrols, provisioner escorts | Unlocked by quest progress | You And What Army 2 |
| Watchtowers garrisoned across the Commonwealth | After the Castle is retaken | Minuteman Watchtowers |
| The Castle walls | Restored after Old Guns; a 7-day failsafe rebuilds them if the restoration stalls | Restoring The Castle, Restoring The Castle Extended |
| Nuka-World | During Open Season you can call the Minutemen to storm the park; after Open Season the parks fill with settlers, traders and travellers | Minutemen Takeover, Nuka World Open Season Extend II |
| Ending | A Minutemen ending still lets a Brotherhood Paladin finish their career | A New Dawn |

## Brotherhood of Steel

| What changes | How it starts | Mods |
| --- | --- | --- |
| Rank-correct power armour, new ranks, pilots, tougher vertibirds, later encounters | From the Brotherhood's arrival | Improved Brotherhood of Steel, Strength in Steel, Sons of Steel |
| The Prydwen | Reworked decks, bathrooms, bunks, a lab, a cargo lift, a laundry | A Sensible Prydwen Overhaul and its Extras |
| Boston Airport | Cleaned and rebuilt as a base with a full workbench | Boston Airport Redux |
| Cambridge Police Station | A lived-in outpost with a settlement and a player home; recon quests after Fort Strong | Cambridge Police Station Redux |
| Fort Strong | The vanilla quest becomes a real assault, followed by a garrison, a companion and a settlement | Show No Mercy |
| A scribe's questline | A voiced story about water and power for settlements | David Hunter - A Brotherhood Story |
| T-60 and X-01 | T-60 is Brotherhood-only; X-01 is a single unique set | Lunar - AltT60X01 |
| Danse | If he follows you later in the story, the Brotherhood does not turn hostile | HE'S WITH ME |
| Railroad timing | Starting Tactical Thinking no longer locks out PAM, and telling Kells you're not ready really delays | Delay Tactical Thinking |

## Quests and companions

| Content | Where or when | Mods |
| --- | --- | --- |
| Enclave storyline, 24 quests | Found while exploring. Its route locks if you reach Mass Fusion with another faction first | America Rising 2 |
| Short quest with a player home | At Moe's stall in Diamond City, between 22:00 and 08:00 | Modding for Charity - Trunk's Malfunction |
| Short voiced questline with a player home | Found while exploring | Modding for Charity - Shady Motives |
| A voiced ghoul companion | At the end of a quest; the player has no voice in it, so keep subtitles on | Gone Feral |
| A voiced companion with four quests | Starts at the Parkview Lounge | It's Molly |
| An island with a quest and a settlement | Its own worldspace, recommended from level 25 | Misery Island |
| Quests and companions across the map | Found while exploring | Tales from the Commonwealth |
| Five caves, each with a quest | Found while exploring | Caves Of The Commonwealth |
| Automatron and the free Creation Club quests | Start like base-game quests, with random encounters leading to them | Integrated Addons |

## New places

- **Towns**: Diamond City, Goodneighbor and Concord are expanded and inhabited; Lexington, Nahant and Quincy are denser and harder.
- **Interiors and dungeons**: boarded doors that open, new dungeons, interiors behind empty map markers, a subway network with a station town, a rooftop network for snipers, story bunkers. (Inside Jobs, Jurttu's Interiors, Vanilla Locations Plus 1 and 2, Subway Runner, The Rooftops, Bunker Stories.)
- **Lived-in raider sites**: several raider places and unmarked camps tell who lived there. (People Live In.)
- **Far Harbor**: dozens of new encounters and interiors, three player homes. (Far Better Far Harbor.)
- **Map**: hundreds of extra markers and visible roads on the Pip-Boy map. (Cartographers Map Markers, Improved Map with Visible Roads.)

## Gear

- **Guns**: dozens of lore and makeshift guns, a New Vegas anti-materiel rifle, heavy makeshift weapons from level 16, a rebar launcher; some guns take several ammo types.
- **Reloads**: a second animation when the magazine is not empty; lever actions reload shell by shell.
- **Armour and outfits**: Hellcat power armour, raider and Gunner outfits, Minutemen militia outfits, backpacks that raise carry weight, a RobCo combat armour, tactical gloves.
- **Fusion cores**: the most drained core is used first.
- **Favourites**: favourited weapons show holstered on your body.

## Feel

First-person body, arms when running and swimming, weapon inertia, breathing, wet skin in rain, flinching at explosions, eating and drinking animations, weapons lowered out of combat, and a soundscape reworked from footsteps to music.
