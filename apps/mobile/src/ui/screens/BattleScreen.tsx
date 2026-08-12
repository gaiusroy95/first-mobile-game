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
  const setWaitingForOpponent = useMatchStore((state) => state.setWaitingForOpponent);
  const setResult = useBattleStore((state) => state.setResult);
  const [status, setStatus] = useState("Arrange your formation — 20s");
  const startedRef = useRef(false);
  const playedResultRef = useRef(false);

  useEffect(() => {
    if (!matchId || !localSide) {
      navigation.replace("Lobby");
    }
  }, [matchId, localSide, navigation]);

  useEffect(() => {
    if (!matchId || !localSide || roster.length === 0 || startedRef.current) return;
    startedRef.current = true;
    gameRef.current?.loadHeroes(roster, localSide);
    gameRef.current?.startFormationPhase(20);
  }, [matchId, localSide, roster]);

  useEffect(() => {
    if (!battleResult || playedResultRef.current) return;
    playedResultRef.current = true;
    setStatus("Battle playing...");
    gameRef.current?.setFormation([battleResult.formationA, battleResult.formationB]);
    gameRef.current?.playBattle(battleResult.events, battleResult.winner, battleResult.rewards);
  }, [battleResult]);

  const handleFormationConfirmed = async (formation: Formation) => {
    if (!matchId || !playerId) return;
    setWaitingForOpponent(true);
    setStatus("Formation locked — waiting for opponent...");
    try {
      await submitFormation(matchId, { ...formation, playerId });
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to submit formation");
      setWaitingForOpponent(false);
    }
  };

  const handleBattleFinished = (winner: PlayerSide, rewards: Parameters<typeof setResult>[1]) => {
    setResult(winner, rewards);
    navigation.replace("Victory");
  };

  return (
    <ScreenContainer padded={false}>
      <View className="px-4 py-2">
        <Text className="text-lg font-semibold text-white">{status}</Text>
        {waitingForOpponent ? (
          <Text className="text-xs text-muted">Opponent is still arranging...</Text>
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
