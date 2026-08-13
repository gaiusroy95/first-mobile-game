import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { Formation, PlayerSide } from "@battle-formation/shared-types";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../state/authStore";
import { useBattleStore } from "../../state/battleStore";
import { useMatchStore } from "../../state/matchStore";
import { submitFormation } from "../../api/endpoints/battles";
import { GameContainer, type GameContainerHandle } from "../../game/GameContainer";
import { useFormationStore, SQUAD_SIZE } from "../../state/formationStore";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Battle">;

export function BattleScreen({ navigation }: Props) {
  const gameRef = useRef<GameContainerHandle>(null);
  const playerId = useAuthStore((state) => state.playerId);
  const matchId = useMatchStore((state) => state.matchId);
  const localSide = useMatchStore((state) => state.localSide);
  const roster = useMatchStore((state) => state.roster);
  const battleResult = useMatchStore((state) => state.battleResult);
  const waitingForOpponent = useMatchStore((state) => state.waitingForOpponent);
  const isPractice = useMatchStore((state) => state.isPractice);
  const formationDeadline = useMatchStore((state) => state.formationDeadline);
  const setWaitingForOpponent = useMatchStore((state) => state.setWaitingForOpponent);
  const setBattleResult = useMatchStore((state) => state.setBattleResult);
  const setResult = useBattleStore((state) => state.setResult);
  const selectedInstanceIds = useFormationStore((state) => state.selectedInstanceIds);
  const [phase, setPhase] = useState<"prep" | "waiting" | "fight">("prep");
  const [status, setStatus] = useState("Drag 6 heroes onto your grid. Front = tanks. Back = damage.");
  const startedRef = useRef(false);
  const playedResultRef = useRef(false);

  useEffect(() => {
    if (!matchId && !localSide) {
      navigation.replace("Lobby");
    }
  }, [matchId, localSide, navigation]);

  useEffect(() => {
    if (!matchId || !localSide || roster.length === 0 || startedRef.current) return;
    startedRef.current = true;
    const localHeroes = roster.filter((hero) => hero.side === localSide);
    const picked =
      selectedInstanceIds.length === SQUAD_SIZE
        ? localHeroes.filter((hero) => selectedInstanceIds.includes(hero.instanceId))
        : localHeroes.slice(0, SQUAD_SIZE);
    const squad = picked.length === SQUAD_SIZE ? picked : localHeroes.slice(0, SQUAD_SIZE);
    const opponents = roster.filter((hero) => hero.side !== localSide);
    const remainingSeconds = formationDeadline
      ? Math.max(8, Math.ceil((Date.parse(formationDeadline) - Date.now()) / 1000))
      : 20;
    gameRef.current?.loadHeroes([...squad, ...opponents], localSide);
    gameRef.current?.startFormationPhase(remainingSeconds);
  }, [matchId, localSide, roster, selectedInstanceIds, formationDeadline]);

  useEffect(() => {
    if (!battleResult || playedResultRef.current) return;
    playedResultRef.current = true;
    setPhase("fight");
    setStatus("Battle in progress — your heroes fight on their own.");
    gameRef.current?.setFormation([battleResult.formationA, battleResult.formationB]);
    gameRef.current?.playBattle(battleResult.events, battleResult.winner, battleResult.rewards);
  }, [battleResult]);

  const handleFormationConfirmed = async (formation: Formation) => {
    if (!matchId || !playerId) return;
    setWaitingForOpponent(true);
    setPhase("waiting");
    setStatus(
      isPractice
        ? "Formation locked. Training Bot is locking in…"
        : "Formation locked. Waiting for your opponent to finish placing…"
    );
    try {
      const payload = await submitFormation(matchId, { ...formation, playerId });
      if (payload?.events?.length) {
        setBattleResult(payload);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to submit formation");
      setWaitingForOpponent(false);
      setPhase("prep");
    }
  };

  const handleBattleFinished = (winner: PlayerSide, rewards: Parameters<typeof setResult>[1]) => {
    setResult(winner, rewards);
    navigation.replace("Victory");
  };

  const phaseLabel =
    phase === "prep" ? "Preparation · 20s" : phase === "waiting" ? "Waiting" : "Auto-battle";

  return (
    <ScreenContainer padded={false}>
      <View className="border-b border-border bg-surface px-5 py-3">
        <Text className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">
          {phaseLabel}
        </Text>
        <Text className="mt-1 text-base font-semibold text-ink">{status}</Text>
        {waitingForOpponent ? (
          <Text className="mt-1 text-xs text-muted">You can still watch your locked board.</Text>
        ) : null}
      </View>
      <GameContainer
        ref={gameRef}
        onFormationConfirmed={(formation) => void handleFormationConfirmed(formation)}
        onBattleFinished={handleBattleFinished}
        onError={(message) => console.error("[game]", message)}
      />
    </ScreenContainer>
  );
}
