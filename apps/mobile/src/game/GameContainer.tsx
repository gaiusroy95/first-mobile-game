import { forwardRef, useImperativeHandle, useRef } from "react";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import { GAME_HTML } from "./gameBundle.generated";
import { useGameBridgeTransport } from "./useGameBridgeTransport";
import type { GameContainerHandle, GameContainerProps } from "./GameContainer.types";

export type { GameContainerHandle } from "./GameContainer.types";

/**
 * Native host: Phaser lives inside a real WebView. See GameContainer.web.tsx
 * for the browser counterpart (a plain iframe) - React Native's bundler
 * resolves "./GameContainer" to whichever of these two files matches the
 * platform being built, so nothing that renders <GameContainer> needs to
 * know or care which one it got.
 */
export const GameContainer = forwardRef<GameContainerHandle, GameContainerProps>(
  ({ onFormationConfirmed, onBattleFinished, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);

    const { send, handleRawMessage } = useGameBridgeTransport({
      postRaw: (raw) => webViewRef.current?.postMessage(raw),
      onFormationConfirmed,
      onBattleFinished,
      onError,
    });

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

    const handleMessage = (event: WebViewMessageEvent) => handleRawMessage(event.nativeEvent.data);

    return (
      <WebView
        ref={webViewRef}
        source={{ html: GAME_HTML }}
        originWhitelist={["*"]}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled={false}
        allowFileAccess={false}
        style={{ flex: 1, backgroundColor: "#0f172a" }}
      />
    );
  }
);

GameContainer.displayName = "GameContainer";
