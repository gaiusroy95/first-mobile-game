import type { Ability, HeroClass, HeroDefinition, HeroRarity, FactionId, ArmyRole } from "@battle-formation/shared-types";

interface CatalogEntry {
  id: string;
  name: string;
  class: HeroClass;
  rarity: HeroRarity;
  faction: FactionId;
  role: ArmyRole;
  stats: HeroDefinition["baseStats"];
  abilities: Ability[];
  locked?: boolean;
}

function entry(item: CatalogEntry): HeroDefinition {
  return {
    id: item.id,
    name: item.name,
    class: item.class,
    rarity: item.rarity,
    faction: item.faction,
    role: item.role,
    baseStats: item.stats,
    abilities: item.abilities,
    locked: item.locked,
  };
}

const rally = (id: string, name: string): Ability => ({
  id,
  name,
  description: "Raises nearby allies' attack.",
  cooldown: 10,
  kind: "buff",
  stat: "attack",
  power: 0.22,
  duration: 5,
  radius: 1,
});

const guard = (id: string): Ability => ({
  id,
  name: "Hold the Line",
  description: "Shields the most wounded ally.",
  cooldown: 12,
  kind: "shield",
  power: 3.6,
  duration: 5,
});

const strike = (id: string, name: string, power: number): Ability => ({
  id,
  name,
  description: "A decisive blow against the current target.",
  cooldown: 7,
  kind: "damage",
  power,
});

const volley = (id: string, name: string): Ability => ({
  id,
  name,
  description: "Pierces through nearby enemies.",
  cooldown: 10,
  kind: "damage",
  power: 1.25,
  radius: 1,
});

const mend = (id: string, name: string): Ability => ({
  id,
  name,
  description: "Restores the lowest-health ally.",
  cooldown: 7,
  kind: "heal",
  power: 1.45,
});

/**
 * Commanders + army units from the client's faction art.
 * Persian / Crusader stay locked until their unit sheets land.
 */
export const heroDatabase: HeroDefinition[] = [
  entry({
    id: "cmd-arab",
    name: "Zahir the Oathbound",
    class: "commander",
    rarity: "legendary",
    faction: "arab",
    role: "commander",
    stats: { hp: 135, attack: 20, defense: 14, attackSpeed: 1.15, range: 1, movementSpeed: 3 },
    abilities: [rally("zahir-rally", "Crescent Rally"), strike("zahir-blades", "Twin Shamshir", 1.55)],
  }),
  entry({
    id: "cmd-samurai",
    name: "Lord Takeshi",
    class: "commander",
    rarity: "legendary",
    faction: "samurai",
    role: "commander",
    stats: { hp: 128, attack: 22, defense: 13, attackSpeed: 1.2, range: 1, movementSpeed: 3 },
    abilities: [strike("takeshi-iaido", "Iaido Cut", 1.85), rally("takeshi-honor", "Bushido")],
  }),
  entry({
    id: "cmd-byzantine",
    name: "Basileus Niketas",
    class: "commander",
    rarity: "legendary",
    faction: "byzantine",
    role: "commander",
    stats: { hp: 150, attack: 15, defense: 20, attackSpeed: 0.95, range: 1, movementSpeed: 2 },
    abilities: [guard("niketas-aegis"), rally("niketas-order", "Imperial Order")],
  }),
  entry({
    id: "cmd-janissary",
    name: "Agha Selim",
    class: "commander",
    rarity: "legendary",
    faction: "janissary",
    role: "commander",
    stats: { hp: 125, attack: 21, defense: 12, attackSpeed: 1.05, range: 4, movementSpeed: 3 },
    abilities: [volley("selim-volley", "Sultan's Volley"), rally("selim-drill", "Barracks Drill")],
  }),
  entry({
    id: "cmd-mongol",
    name: "Khan Temujin",
    class: "commander",
    rarity: "legendary",
    faction: "mongol",
    role: "commander",
    stats: { hp: 118, attack: 23, defense: 10, attackSpeed: 1.35, range: 3, movementSpeed: 4 },
    abilities: [
      volley("temujin-storm", "Arrow Storm"),
      { id: "temujin-hunt", name: "Steppe Hunt", description: "Slows the hunted target.", cooldown: 9, kind: "slow", power: 0.4, duration: 3 },
    ],
  }),
  entry({
    id: "cmd-viking",
    name: "Jarl Fenrir",
    class: "commander",
    rarity: "legendary",
    faction: "viking",
    role: "commander",
    stats: { hp: 160, attack: 19, defense: 16, attackSpeed: 0.95, range: 1, movementSpeed: 3 },
    abilities: [
      { id: "fenrir-slam", name: "Shield Slam", description: "Stuns the target.", cooldown: 8, kind: "freeze", duration: 1.2 },
      rally("fenrir-rage", "Raid Horn"),
    ],
  }),
  entry({
    id: "cmd-persian",
    name: "Shah Darius",
    class: "commander",
    rarity: "legendary",
    faction: "persian",
    role: "commander",
    stats: { hp: 132, attack: 18, defense: 15, attackSpeed: 1.1, range: 1, movementSpeed: 3 },
    abilities: [rally("darius-sun", "Sun Banner")],
    locked: true,
  }),
  entry({
    id: "cmd-crusader",
    name: "Lord Baldwin",
    class: "commander",
    rarity: "legendary",
    faction: "crusader",
    role: "commander",
    stats: { hp: 148, attack: 17, defense: 18, attackSpeed: 1, range: 1, movementSpeed: 2 },
    abilities: [guard("baldwin-cross")],
    locked: true,
  }),

  entry({
    id: "unit-arab-vanguard",
    name: "Desert Vanguard",
    class: "tank",
    rarity: "rare",
    faction: "arab",
    role: "unit",
    stats: { hp: 175, attack: 11, defense: 22, attackSpeed: 0.8, range: 1, movementSpeed: 2 },
    abilities: [guard("arab-wall")],
  }),
  entry({
    id: "unit-arab-blademaster",
    name: "Crescent Blademaster",
    class: "knight",
    rarity: "rare",
    faction: "arab",
    role: "unit",
    stats: { hp: 120, attack: 22, defense: 10, attackSpeed: 1.35, range: 1, movementSpeed: 4 },
    abilities: [strike("arab-crescent", "Crescent Slash", 1.6)],
  }),
  entry({
    id: "unit-arab-mystic",
    name: "Dune Mystic",
    class: "healer",
    rarity: "epic",
    faction: "arab",
    role: "unit",
    stats: { hp: 95, attack: 9, defense: 8, attackSpeed: 1, range: 3, movementSpeed: 2 },
    abilities: [mend("arab-oasis", "Oasis Blessing")],
  }),

  entry({
    id: "unit-samurai-yari",
    name: "Iron Yari Guard",
    class: "tank",
    rarity: "rare",
    faction: "samurai",
    role: "unit",
    stats: { hp: 170, attack: 12, defense: 21, attackSpeed: 0.85, range: 1, movementSpeed: 2 },
    abilities: [guard("samurai-yari-wall")],
  }),
  entry({
    id: "unit-samurai-katana",
    name: "Katana Master",
    class: "knight",
    rarity: "rare",
    faction: "samurai",
    role: "unit",
    stats: { hp: 125, attack: 21, defense: 12, attackSpeed: 1.25, range: 1, movementSpeed: 3 },
    abilities: [strike("samurai-iaijutsu", "Iaijutsu", 1.7)],
  }),
  entry({
    id: "unit-samurai-archer",
    name: "Hoyumi Archer",
    class: "archer",
    rarity: "rare",
    faction: "samurai",
    role: "unit",
    stats: { hp: 88, attack: 21, defense: 7, attackSpeed: 1.4, range: 5, movementSpeed: 3 },
    abilities: [volley("samurai-arrow-rain", "Arrow Rain")],
  }),

  entry({
    id: "unit-byzantine-guard",
    name: "Imperial Shield Guard",
    class: "tank",
    rarity: "rare",
    faction: "byzantine",
    role: "unit",
    stats: { hp: 185, attack: 9, defense: 24, attackSpeed: 0.75, range: 1, movementSpeed: 2 },
    abilities: [guard("byz-wall")],
  }),
  entry({
    id: "unit-byzantine-lancer",
    name: "Palace Lancer",
    class: "knight",
    rarity: "rare",
    faction: "byzantine",
    role: "unit",
    stats: { hp: 130, attack: 20, defense: 14, attackSpeed: 1.1, range: 1, movementSpeed: 3 },
    abilities: [strike("byz-pierce", "Constantine Thrust", 1.5)],
  }),
  entry({
    id: "unit-byzantine-strategos",
    name: "Sacred Strategos",
    class: "healer",
    rarity: "epic",
    faction: "byzantine",
    role: "unit",
    stats: { hp: 100, attack: 8, defense: 11, attackSpeed: 0.95, range: 3, movementSpeed: 2 },
    abilities: [
      mend("byz-liturgy", "Sacred Liturgy"),
      { id: "byz-bless", name: "Aegis Blessing", description: "Raises an ally's defense.", cooldown: 13, kind: "buff", stat: "defense", power: 0.28, duration: 5 },
    ],
  }),

  entry({
    id: "unit-janissary-guard",
    name: "Sultan's Guard",
    class: "tank",
    rarity: "rare",
    faction: "janissary",
    role: "unit",
    stats: { hp: 168, attack: 12, defense: 20, attackSpeed: 0.85, range: 1, movementSpeed: 2 },
    abilities: [guard("jan-guard")],
  }),
  entry({
    id: "unit-janissary-musketeer",
    name: "Janissary Musketeer",
    class: "archer",
    rarity: "rare",
    faction: "janissary",
    role: "unit",
    stats: { hp: 92, attack: 23, defense: 8, attackSpeed: 1.15, range: 5, movementSpeed: 3 },
    abilities: [volley("jan-musket", "Armor-Piercing Shot")],
  }),
  entry({
    id: "unit-janissary-officer",
    name: "Fire Command Officer",
    class: "healer",
    rarity: "epic",
    faction: "janissary",
    role: "unit",
    stats: { hp: 105, attack: 10, defense: 10, attackSpeed: 1, range: 3, movementSpeed: 2 },
    abilities: [rally("jan-inspire", "Inspire Ranks"), mend("jan-field", "Field Dressing")],
  }),

  entry({
    id: "unit-mongol-raider",
    name: "Steppe Raider",
    class: "assassin",
    rarity: "rare",
    faction: "mongol",
    role: "unit",
    stats: { hp: 100, attack: 24, defense: 8, attackSpeed: 1.5, range: 1, movementSpeed: 4 },
    abilities: [strike("mongol-flank", "Flank Cut", 1.75)],
  }),
  entry({
    id: "unit-mongol-horse-archer",
    name: "Horse Archer",
    class: "archer",
    rarity: "rare",
    faction: "mongol",
    role: "unit",
    stats: { hp: 90, attack: 20, defense: 7, attackSpeed: 1.55, range: 5, movementSpeed: 4 },
    abilities: [volley("mongol-kiting", "Hit and Run")],
  }),
  entry({
    id: "unit-mongol-scout",
    name: "Eagle Scout",
    class: "assassin",
    rarity: "epic",
    faction: "mongol",
    role: "unit",
    stats: { hp: 85, attack: 18, defense: 7, attackSpeed: 1.45, range: 3, movementSpeed: 4 },
    abilities: [
      { id: "mongol-mark", name: "Eagle Mark", description: "Slows a marked enemy.", cooldown: 8, kind: "slow", power: 0.45, duration: 4 },
    ],
  }),

  entry({
    id: "unit-viking-shield",
    name: "Frost Shield Bearer",
    class: "tank",
    rarity: "rare",
    faction: "viking",
    role: "unit",
    stats: { hp: 180, attack: 11, defense: 21, attackSpeed: 0.8, range: 1, movementSpeed: 2 },
    abilities: [guard("viking-frost-wall")],
  }),
  entry({
    id: "unit-viking-berserker",
    name: "Berserker of the North",
    class: "knight",
    rarity: "rare",
    faction: "viking",
    role: "unit",
    stats: { hp: 140, attack: 24, defense: 9, attackSpeed: 1.2, range: 1, movementSpeed: 3 },
    abilities: [strike("viking-frenzy", "Blood Frenzy", 1.8)],
  }),
  entry({
    id: "unit-viking-shaman",
    name: "Rune Shaman",
    class: "healer",
    rarity: "epic",
    faction: "viking",
    role: "unit",
    stats: { hp: 98, attack: 9, defense: 9, attackSpeed: 0.95, range: 3, movementSpeed: 2 },
    abilities: [mend("viking-runes", "Rune Mend")],
  }),

  entry({
    id: "unit-persian-immortal",
    name: "Immortal Spearman",
    class: "tank",
    rarity: "rare",
    faction: "persian",
    role: "unit",
    stats: { hp: 165, attack: 13, defense: 19, attackSpeed: 0.9, range: 1, movementSpeed: 2 },
    abilities: [guard("persian-immortal")],
    locked: true,
  }),
  entry({
    id: "unit-persian-archer",
    name: "Sparabara Archer",
    class: "archer",
    rarity: "rare",
    faction: "persian",
    role: "unit",
    stats: { hp: 88, attack: 20, defense: 8, attackSpeed: 1.3, range: 5, movementSpeed: 3 },
    abilities: [volley("persian-bow", "Palace Bow")],
    locked: true,
  }),
  entry({
    id: "unit-persian-magus",
    name: "Magus of Fire",
    class: "fire-mage",
    rarity: "epic",
    faction: "persian",
    role: "unit",
    stats: { hp: 82, attack: 24, defense: 6, attackSpeed: 0.9, range: 4, movementSpeed: 2 },
    abilities: [{ id: "persian-fire", name: "Atar Flame", description: "Burns nearby foes.", cooldown: 9, kind: "damage", power: 1.55, radius: 1 }],
    locked: true,
  }),
  entry({
    id: "unit-crusader-templar",
    name: "Templar Knight",
    class: "tank",
    rarity: "rare",
    faction: "crusader",
    role: "unit",
    stats: { hp: 178, attack: 12, defense: 22, attackSpeed: 0.8, range: 1, movementSpeed: 2 },
    abilities: [guard("crusader-templar")],
    locked: true,
  }),
  entry({
    id: "unit-crusader-sergeant",
    name: "Crusader Sergeant",
    class: "knight",
    rarity: "rare",
    faction: "crusader",
    role: "unit",
    stats: { hp: 135, attack: 18, defense: 15, attackSpeed: 1.05, range: 1, movementSpeed: 3 },
    abilities: [strike("crusader-charge", "Holy Charge", 1.5)],
    locked: true,
  }),
  entry({
    id: "unit-crusader-chaplain",
    name: "Battlefield Chaplain",
    class: "healer",
    rarity: "epic",
    faction: "crusader",
    role: "unit",
    stats: { hp: 102, attack: 8, defense: 10, attackSpeed: 1, range: 3, movementSpeed: 2 },
    abilities: [mend("crusader-prayer", "Battle Prayer")],
    locked: true,
  }),
];

/** Old catalog ids still sitting in some player rows. */
export const LEGACY_HERO_ALIASES: Record<string, string> = {
  "commander-01": "cmd-arab",
  "tank-01": "unit-byzantine-guard",
  "knight-01": "unit-samurai-katana",
  "archer-01": "unit-mongol-horse-archer",
  "fire-mage-01": "unit-janissary-musketeer",
  "ice-mage-01": "unit-viking-shaman",
  "assassin-01": "unit-arab-blademaster",
  "healer-01": "unit-arab-mystic",
};

export const PLAYER_STARTER_IDS = [
  "cmd-arab",
  "unit-arab-vanguard",
  "unit-arab-blademaster",
  "unit-arab-mystic",
  "unit-byzantine-guard",
  "unit-byzantine-lancer",
  "unit-byzantine-strategos",
] as const;

export const BOT_STARTER_IDS = [
  "cmd-viking",
  "unit-viking-shield",
  "unit-viking-berserker",
  "unit-viking-shaman",
  "unit-mongol-raider",
  "unit-mongol-horse-archer",
  "unit-mongol-scout",
] as const;
