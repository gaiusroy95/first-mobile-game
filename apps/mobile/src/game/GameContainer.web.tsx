import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { View } from "react-native";
import { GAME_HTML } from "./gameBundle.generated";
import { useGameBridgeTransport } from "./useGameBridgeTransport";
import type { GameContainerHandle, GameContainerProps } from "./GameContainer.types";

export type { GameContainerHandle } from "./GameContainer.types";

/**
 * Web host: a browser doesn't need react-native-webview to embed content -
 * it already has an iframe. Same bridge protocol, same GAME_HTML, same
 * GameContainerHandle as the native file.
 */
export const GameContainer = forwardRef<GameContainerHandle, GameContainerProps>(
  ({ onFormationConfirmed, onBattleFinished, onError }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const handleRawMessageRef = useRef<(raw: string) => void>(() => undefined);
    const [srcDoc, setSrcDoc] = useState<string | undefined>(undefined);

    const { send, handleRawMessage } = useGameBridgeTransport({
      postRaw: (raw) => iframeRef.current?.contentWindow?.postMessage(raw, "*"),
      onFormationConfirmed,
      onBattleFinished,
      onError,
    });
    handleRawMessageRef.current = handleRawMessage;

    useImperativeHandle(ref, () => ({
      loadHeroes: (heroes, localSide) =>
        send({ type: "LOAD_HEROES", payload: { heroes, localSide } }),
      startFormationPhase: (durationSeconds) =>
        send({ type: "START_FORMATION_PHASE", payload: { durationSeconds } }),
      setFormation: (formations) => send({ type: "SET_FORMATION", payload: { formations } }),
      startBattle: (seed) => send({ type: "START_BATTLE", payload: { seed } }),
      playBattle: (events, winner, rewards) =>
        send({ type: "PLAY_BATTLE", payload: { events, winner, rewards } }),
    }));

    useEffect(() => {
      const listener = (event: MessageEvent) => {
        if (event.source !== iframeRef.current?.contentWindow) return;
        if (typeof event.data !== "string") return;
        handleRawMessageRef.current(event.data);
      };
      window.addEventListener("message", listener);
      setSrcDoc(GAME_HTML);
      return () => window.removeEventListener("message", listener);
    }, []);

    return (
      <View style={{ flex: 1, width: "100%", minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          title="Battle Formation"
          style={{
            flex: 1,
            border: "none",
            backgroundColor: "#0b1210",
            width: "100%",
            height: "100%",
            display: "block",
          }}
        />
      </View>
    );
  }
);

GameContainer.displayName = "GameContainer";
