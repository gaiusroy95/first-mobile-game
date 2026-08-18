import { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { usePlayerStore } from "../../state/playerStore";
import { useHeroStore } from "../../state/heroStore";
import { useMatchStore } from "../../state/matchStore";
import { ART_H, ART_W, FACTIONS, HOTSPOTS, mainMenuArt } from "../main-menu/art";
import { ArtHotspot } from "../main-menu/ArtHotspot";
import { canFieldArmy } from "../../state/heroCatalog";

type Props = NativeStackScreenProps<RootStackParamList, "Lobby">;

export function LobbyScreen({ navigation }: Props) {
  const { width, height } = useWindowDimensions();
  const landscape = width / height >= 1.2;

  const displayName = useAuthStore((state) => state.displayName);
  const playerId = useAuthStore((state) => state.playerId);
  const logout = useAuthStore((state) => state.logout);
  const gold = usePlayerStore((state) => state.gold);
  const trophies = usePlayerStore((state) => state.trophies);
  const gems = usePlayerStore((state) => state.gems);
  const level = usePlayerStore((state) => state.level);
  const refreshProfile = usePlayerStore((state) => state.refreshProfile);
  const ownedHeroes = useHeroStore((state) => state.ownedHeroes);
  const fetchOwnedHeroes = useHeroStore((state) => state.fetchOwnedHeroes);
  const queueStatus = useMatchStore((state) => state.queueStatus);
  const queueError = useMatchStore((state) => state.queueError);
  const matchId = useMatchStore((state) => state.matchId);
  const localSide = useMatchStore((state) => state.localSide);
  const roster = useMatchStore((state) => state.roster);
  const battleResult = useMatchStore((state) => state.battleResult);
  const findMatch = useMatchStore((state) => state.findMatch);
  const practiceMatch = useMatchStore((state) => state.practiceMatch);
  const cancelQueue = useMatchStore((state) => state.cancelQueue);
  const bindSocket = useMatchStore((state) => state.bindSocket);
  const isPractice = useMatchStore((state) => state.isPractice);

  const [factionId, setFactionId] = useState<string>(FACTIONS[0].id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const canBattle = canFieldArmy(ownedHeroes);

  useEffect(() => {
    if (playerId) {
      bindSocket(playerId);
    }
    void refreshProfile();
    void fetchOwnedHeroes();
  }, [playerId, bindSocket, refreshProfile, fetchOwnedHeroes]);

  useEffect(() => {
    if (queueStatus === "matched" && matchId && localSide && roster.length > 0 && !battleResult) {
      navigation.navigate("Battle");
    }
  }, [queueStatus, matchId, localSide, roster.length, battleResult, navigation]);

  const statusLine = useMemo(() => {
    if (queueError) return queueError;
    if (hint) return hint;
    if (queueStatus === "queued") {
      return isPractice ? "Starting practice…" : "Searching for an opponent…";
    }
    return null;
  }, [queueError, hint, queueStatus, isPractice]);

  const onBattle = () => {
    setHint(null);
    if (queueStatus === "queued") {
      void cancelQueue();
      return;
    }
    if (!canBattle) {
      setHint("Build a Commander + two-faction army first.");
      return;
    }
    void practiceMatch();
  };

  const actions = {
    ranked: () => {
      setHint(null);
      if (!canBattle) {
        setHint("Build a Commander + two-faction army first.");
        return;
      }
      void findMatch("ranked");
    },
    clan: () => navigation.navigate("Modes"),
    missions: () => navigation.navigate("Modes"),
    store: () => navigation.navigate("Collection"),
    heroes: () => navigation.navigate("Formation"),
    upgrades: () => navigation.navigate("Upgrade"),
    collection: () => navigation.navigate("Collection"),
    events: () => navigation.navigate("Modes"),
    settings: () => setSettingsOpen(true),
    battle: onBattle,
  };

  const onLogout = () => {
    setSettingsOpen(false);
    logout();
    navigation.replace("Login");
  };

  return (
    <View style={styles.root}>
      {landscape ? (
        <LandscapeMenu
          factionId={factionId}
          onFaction={setFactionId}
          actions={actions}
          queued={queueStatus === "queued"}
        />
      ) : (
        <PortraitMenu
          factionId={factionId}
          onFaction={setFactionId}
          actions={actions}
          queued={queueStatus === "queued"}
        />
      )}

      {statusLine ? (
        <View pointerEvents="none" style={styles.statusWrap}>
          <Text style={styles.statusText}>{statusLine}</Text>
        </View>
      ) : null}

      {settingsOpen ? (
        <Pressable style={styles.sheetBackdrop} onPress={() => setSettingsOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Text style={styles.sheetKicker}>Commander</Text>
            <Text style={styles.sheetTitle}>{displayName ?? "Player"}</Text>
            <Text style={styles.sheetMeta}>
              Lv {level} · {gold} gold · {trophies} trophies · {gems} gems
            </Text>
            <Pressable style={styles.sheetLogout} onPress={onLogout}>
              <Text style={styles.sheetLogoutText}>Log out</Text>
            </Pressable>
            <Pressable onPress={() => setSettingsOpen(false)}>
              <Text style={styles.sheetClose}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      ) : null}
    </View>
  );
}

interface MenuProps {
  factionId: string;
  onFaction: (id: string) => void;
  actions: {
    ranked: () => void;
    clan: () => void;
    missions: () => void;
    store: () => void;
    heroes: () => void;
    upgrades: () => void;
    collection: () => void;
    events: () => void;
    settings: () => void;
    battle: () => void;
  };
  queued: boolean;
}

function LandscapeMenu({ factionId, onFaction, actions, queued }: MenuProps) {
  const { width, height } = useWindowDimensions();
  const artRatio = ART_W / ART_H;
  const screenRatio = width / Math.max(height, 1);
  const artWidth = screenRatio > artRatio ? height * artRatio : width;
  const artHeight = artWidth / artRatio;

  return (
    <View style={styles.stage}>
      <View style={{ width: artWidth, height: artHeight }}>
        <Image source={mainMenuArt.full} style={StyleSheet.absoluteFill} resizeMode="stretch" />
        {FACTIONS.map((faction) => (
          <ArtHotspot
            key={faction.id}
            box={faction.box}
            label={faction.name}
            selected={faction.id === factionId}
            onPress={() => onFaction(faction.id)}
          />
        ))}
        <ArtHotspot box={HOTSPOTS.ranked} label="Ranked" onPress={actions.ranked} />
        <ArtHotspot box={HOTSPOTS.clan} label="Clan" onPress={actions.clan} />
        <ArtHotspot box={HOTSPOTS.missions} label="Missions" onPress={actions.missions} />
        <ArtHotspot box={HOTSPOTS.store} label="Store" onPress={actions.store} />
        <ArtHotspot box={HOTSPOTS.heroes} label="Heroes" onPress={actions.heroes} />
        <ArtHotspot box={HOTSPOTS.upgrades} label="Upgrades" onPress={actions.upgrades} />
        <ArtHotspot box={HOTSPOTS.collection} label="Collection" onPress={actions.collection} />
        <ArtHotspot box={HOTSPOTS.events} label="Events" onPress={actions.events} />
        <ArtHotspot box={HOTSPOTS.settings} label="Settings" onPress={actions.settings} />
        <ArtHotspot
          box={HOTSPOTS.battle}
          label={queued ? "Cancel battle" : "Battle"}
          onPress={actions.battle}
        />
      </View>
    </View>
  );
}

function PortraitMenu({ factionId, onFaction, actions, queued }: MenuProps) {
  const { width } = useWindowDimensions();
  const pad = 8;
  const inner = Math.max(width - pad * 2, 1);
  const colGap = 4;
  const cellW = Math.floor((inner - colGap * 3) / 4);
  const cellH = Math.round(cellW * (280 / 156));
  const heroH = Math.round(width * (488 / 976));
  const titleW = Math.round(inner * 0.9);
  const titleH = Math.round(titleW * (185 / 860));
  const battleW = Math.round(inner * 0.84);
  const battleH = Math.round(battleW * (168 / 496));
  const navH = Math.round(inner / 5);

  return (
    <SafeAreaView style={styles.portrait}>
      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        style={{ width }}
        contentContainerStyle={[styles.portraitContent, { width }]}
      >
        <View style={[styles.topRow, { width, paddingHorizontal: pad }]}>
          <Image
            source={mainMenuArt.tagline}
            style={{ width: Math.min(150, inner * 0.38), height: 28 }}
            resizeMode="contain"
          />
          <View style={styles.topIcons}>
            <IconHit source={mainMenuArt.ranked} label="Ranked" onPress={actions.ranked} size={40} />
            <IconHit source={mainMenuArt.clan} label="Clan" onPress={actions.clan} size={40} />
            <IconHit source={mainMenuArt.missions} label="Missions" onPress={actions.missions} size={40} />
            <IconHit source={mainMenuArt.store} label="Store" onPress={actions.store} size={40} />
          </View>
        </View>

        <View style={{ width, height: heroH, overflow: "hidden", alignItems: "center", justifyContent: "flex-end" }}>
          <Image
            source={mainMenuArt.heroPortrait}
            style={{ position: "absolute", width, height: heroH }}
            resizeMode="cover"
          />
          <Image
            source={mainMenuArt.title}
            style={{ width: titleW, height: titleH, marginBottom: 4 }}
            resizeMode="contain"
          />
        </View>

        <View style={[styles.factionGrid, { width, paddingHorizontal: pad }]}>
          {FACTIONS.map((faction, index) => (
            <Pressable
              key={faction.id}
              accessibilityLabel={faction.name}
              onPress={() => onFaction(faction.id)}
              style={[
                {
                  width: cellW,
                  height: cellH,
                  marginRight: index % 4 === 3 ? 0 : colGap,
                  marginBottom: colGap,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: faction.id === factionId ? GOLD : "transparent",
                },
              ]}
            >
              <Image source={faction.source} style={{ width: cellW, height: cellH }} resizeMode="cover" />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityLabel={queued ? "Cancel battle" : "Battle"}
          onPress={actions.battle}
          style={[styles.battleWrap, { width }]}
        >
          <Image
            source={mainMenuArt.battle}
            style={{ width: battleW, height: battleH }}
            resizeMode="contain"
          />
        </Pressable>

        <View style={[styles.bottomRow, { width, paddingHorizontal: pad }]}>
          <IconHit source={mainMenuArt.heroes} label="Heroes" onPress={actions.heroes} size={navH} />
          <IconHit source={mainMenuArt.upgrades} label="Upgrades" onPress={actions.upgrades} size={navH} />
          <IconHit source={mainMenuArt.collection} label="Collection" onPress={actions.collection} size={navH} />
          <IconHit source={mainMenuArt.events} label="Events" onPress={actions.events} size={navH} />
          <IconHit source={mainMenuArt.settings} label="Settings" onPress={actions.settings} size={navH} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IconHit({
  source,
  label,
  onPress,
  size,
}: {
  source: (typeof mainMenuArt)["ranked"];
  label: string;
  onPress: () => void;
  size: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </Pressable>
  );
}

const GOLD = "#e0b35a";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#05070a",
  },
  stage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#05070a",
    overflow: "hidden",
  },
  portrait: {
    flex: 1,
    width: "100%",
    overflow: "hidden",
    backgroundColor: "#05070a",
  },
  portraitContent: {
    flexGrow: 1,
    paddingBottom: 8,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 48,
  },
  topIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  factionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingTop: 8,
  },
  battleWrap: {
    alignItems: "center",
    marginTop: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 4,
  },
  statusWrap: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 8,
    alignItems: "center",
  },
  statusText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textShadowColor: "#000",
    textShadowRadius: 6,
  },
  sheetBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#12100c",
    borderWidth: 1,
    borderColor: GOLD,
    padding: 20,
    gap: 8,
  },
  sheetKicker: {
    color: GOLD,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  sheetTitle: {
    color: "#f4ead4",
    fontSize: 22,
    fontWeight: "800",
  },
  sheetMeta: {
    color: "#b9a57a",
    fontSize: 13,
    marginBottom: 8,
  },
  sheetLogout: {
    backgroundColor: "#3a1c14",
    borderWidth: 1,
    borderColor: "#c45c26",
    paddingVertical: 12,
    alignItems: "center",
  },
  sheetLogoutText: {
    color: "#f4ead4",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  sheetClose: {
    color: "#b9a57a",
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
