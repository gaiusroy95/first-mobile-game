import type { HeroDefinition } from "@battle-formation/shared-types";

/**
 * The hero database. Adding a hero - even one of an existing class - is
 * exactly one new object literal appended here. Nothing in HeroLoader,
 * HeroManager, the simulation, or the skill system (SkillManager dispatches
 * purely on `ability.kind`) branches on a specific id or class, so nothing
 * else needs to change.
 */
export const heroDatabase: HeroDefinition[] = [
  {
    id: "commander-01",
    name: "Valen",
    class: "commander",
    rarity: "legendary",
    baseStats: { hp: 130, attack: 18, defense: 14, attackSpeed: 1.1, range: 1, movementSpeed: 3 },
    abilities: [
      {
        id: "rally",
        name: "Rally",
        description: "Bolsters nearby allies' attack for a short time.",
        cooldown: 10,
        kind: "buff",
        stat: "attack",
        power: 0.25,
        duration: 5,
        radius: 1,
      },
    ],
  },
  {
    id: "tank-01",
    name: "Bulwark",
    class: "tank",
    rarity: "common",
    baseStats: { hp: 180, attack: 10, defense: 22, attackSpeed: 0.8, range: 1, movementSpeed: 2 },
    abilities: [
      {
        id: "shield-wall",
        name: "Shield Wall",
        description: "Grants a damage-absorbing shield to the ally who needs it most.",
        cooldown: 12,
        kind: "shield",
        power: 4,
        duration: 5,
      },
    ],
  },
  {
    id: "knight-01",
    name: "Sir Aldric",
    class: "knight",
    rarity: "common",
    baseStats: { hp: 140, attack: 16, defense: 16, attackSpeed: 1, range: 1, movementSpeed: 3 },
    abilities: [
      {
        id: "shield-bash",
        name: "Shield Bash",
        description: "Stuns the target, preventing it from acting.",
        cooldown: 8,
        kind: "freeze",
        duration: 1,
      },
    ],
  },
  {
    id: "archer-01",
    name: "Fenwick",
    class: "archer",
    rarity: "rare",
    baseStats: { hp: 90, attack: 20, defense: 8, attackSpeed: 1.4, range: 5, movementSpeed: 3 },
    abilities: [
      {
        id: "piercing-shot",
        name: "Piercing Shot",
        description: "Fires an arrow that pierces through nearby enemies.",
        cooldown: 10,
        kind: "damage",
        power: 1.3,
        radius: 1,
      },
    ],
  },
  {
    id: "fire-mage-01",
    name: "Ignira",
    class: "fire-mage",
    rarity: "rare",
    baseStats: { hp: 80, attack: 24, defense: 6, attackSpeed: 0.9, range: 4, movementSpeed: 2 },
    abilities: [
      {
        id: "fireball",
        name: "Fireball",
        description: "Deals area damage in a radius around the target.",
        cooldown: 9,
        kind: "damage",
        power: 1.6,
        radius: 1,
      },
    ],
  },
  {
    id: "ice-mage-01",
    name: "Frostine",
    class: "ice-mage",
    rarity: "rare",
    baseStats: { hp: 85, attack: 18, defense: 7, attackSpeed: 0.9, range: 4, movementSpeed: 2 },
    abilities: [
      {
        id: "frost-nova",
        name: "Frost Nova",
        description: "Slows all nearby enemies.",
        cooldown: 11,
        kind: "slow",
        power: 0.5,
        radius: 1,
        duration: 4,
      },
    ],
  },
  {
    id: "assassin-01",
    name: "Vex",
    class: "assassin",
    rarity: "epic",
    baseStats: { hp: 95, attack: 26, defense: 7, attackSpeed: 1.6, range: 1, movementSpeed: 4 },
    abilities: [
      {
        id: "backstab",
        name: "Backstab",
        description: "A single devastating strike against the current target.",
        cooldown: 6,
        kind: "damage",
        power: 1.8,
      },
    ],
  },
  {
    id: "healer-01",
    name: "Serenity",
    class: "healer",
    rarity: "epic",
    baseStats: { hp: 100, attack: 8, defense: 9, attackSpeed: 1, range: 3, movementSpeed: 2 },
    abilities: [
      {
        id: "heal",
        name: "Heal",
        description: "Restores HP to the lowest-health ally.",
        cooldown: 7,
        kind: "heal",
        power: 1.5,
      },
      {
        id: "blessing",
        name: "Blessing",
        description: "Bolsters the lowest-health ally's defense for a short time.",
        cooldown: 14,
        kind: "buff",
        stat: "defense",
        power: 0.3,
        duration: 6,
      },
    ],
  },
];
