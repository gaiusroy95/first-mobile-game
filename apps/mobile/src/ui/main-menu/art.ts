import type { ImageSourcePropType } from "react-native";

export const ART_W = 1536;
export const ART_H = 1024;

export const mainMenuArt = {
  full: require("../../../assets/main.jpeg") as ImageSourcePropType,
  title: require("../../../assets/main-ui/title.png") as ImageSourcePropType,
  tagline: require("../../../assets/main-ui/tagline.png") as ImageSourcePropType,
  battle: require("../../../assets/main-ui/battle-btn.png") as ImageSourcePropType,
  bandHero: require("../../../assets/main-ui/band-hero.png") as ImageSourcePropType,
  heroPortrait: require("../../../assets/main-ui/hero-portrait.png") as ImageSourcePropType,
  ranked: require("../../../assets/main-ui/icon-ranked.png") as ImageSourcePropType,
  clan: require("../../../assets/main-ui/icon-clan.png") as ImageSourcePropType,
  missions: require("../../../assets/main-ui/icon-missions.png") as ImageSourcePropType,
  store: require("../../../assets/main-ui/icon-store.png") as ImageSourcePropType,
  heroes: require("../../../assets/main-ui/icon-heroes.png") as ImageSourcePropType,
  upgrades: require("../../../assets/main-ui/icon-upgrades.png") as ImageSourcePropType,
  collection: require("../../../assets/main-ui/icon-collection.png") as ImageSourcePropType,
  events: require("../../../assets/main-ui/icon-events.png") as ImageSourcePropType,
  settings: require("../../../assets/main-ui/icon-settings.png") as ImageSourcePropType,
} as const;

export const FACTIONS = [
  {
    id: "arab",
    name: "Arab Legends",
    source: require("../../../assets/main-ui/faction-01-arab.png") as ImageSourcePropType,
    box: { x: 24, y: 568, w: 156, h: 280 },
  },
  {
    id: "samurai",
    name: "Samurai Empire",
    source: require("../../../assets/main-ui/faction-02-samurai.png") as ImageSourcePropType,
    box: { x: 192, y: 568, w: 164, h: 280 },
  },
  {
    id: "byzantine",
    name: "Byzantine Empire",
    source: require("../../../assets/main-ui/faction-03-byzantine.png") as ImageSourcePropType,
    box: { x: 368, y: 568, w: 180, h: 280 },
  },
  {
    id: "janissary",
    name: "Janissary Brothers",
    source: require("../../../assets/main-ui/faction-04-janissary.png") as ImageSourcePropType,
    box: { x: 568, y: 568, w: 176, h: 280 },
  },
  {
    id: "mongol",
    name: "Mongol Horde",
    source: require("../../../assets/main-ui/faction-05-mongol.png") as ImageSourcePropType,
    box: { x: 760, y: 568, w: 196, h: 280 },
  },
  {
    id: "viking",
    name: "Viking Raiders",
    source: require("../../../assets/main-ui/faction-06-viking.png") as ImageSourcePropType,
    box: { x: 976, y: 568, w: 156, h: 280 },
  },
  {
    id: "persian",
    name: "Persian Empire",
    source: require("../../../assets/main-ui/faction-07-persian.png") as ImageSourcePropType,
    box: { x: 1144, y: 568, w: 164, h: 280 },
  },
  {
    id: "crusader",
    name: "Crusader Knights",
    source: require("../../../assets/main-ui/faction-08-crusader.png") as ImageSourcePropType,
    box: { x: 1320, y: 568, w: 178, h: 280 },
  },
] as const;

export const HOTSPOTS = {
  ranked: { x: 1184, y: 4, w: 88, h: 88 },
  clan: { x: 1272, y: 4, w: 84, h: 88 },
  missions: { x: 1356, y: 4, w: 84, h: 88 },
  store: { x: 1440, y: 4, w: 92, h: 88 },
  battle: { x: 520, y: 848, w: 496, h: 168 },
  heroes: { x: 56, y: 900, w: 140, h: 120 },
  upgrades: { x: 220, y: 900, w: 152, h: 120 },
  collection: { x: 1152, y: 900, w: 120, h: 120 },
  events: { x: 1276, y: 900, w: 116, h: 120 },
  settings: { x: 1400, y: 900, w: 124, h: 120 },
} as const;

export type HotspotBox = { x: number; y: number; w: number; h: number };
