import { forwardRef, useImperativeHandle, useRef } from "react";
import WebView, { type WebViewMessageEvent } from "react-native-webview";
import type {
  BattleRewards,
  BridgeInboundMessage,
  BridgeOutboundMessage,
  Formation,
  PlayerSide,
  RosterHero,
} from "@battle-formation/shared-types";
import { GAME_HTML } from "./gameBundle.generated";

export interface GameContainerHandle {
  loadHeroes: (heroes: RosterHero[]) => void;
  startFormationPhase: (durationSeconds: number) => void;
  setFormation: (formations: [Formation, Formation]) => void;
  startBattle: (seed: number) => void;
}

interface GameContainerProps {
  onFormationConfirmed: (formation: Formation) => void;
  onBattleFinished: (winner: PlayerSide, rewards: BattleRewards) => void;
  onError?: (message: string) => void;
}

/**
 * The ONLY component in the app that knows Phaser lives inside a WebView.
 * Screens never touch postMessage or a WebView ref - they call the
 * imperative handle (loadHeroes/startFormationPhase/setFormation/
 * startBattle) and receive results through onFormationConfirmed/
 * onBattleFinished/onError. Swapping the renderer for something other than
 * Phaser+WebView later only means rewriting this one file; every screen
 * that uses <GameContainer> stays untouched.
 */
export const GameContainer = forwardRef<GameContainerHandle, GameContainerProps>(
  ({ onFormationConfirmed, onBattleFinished, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const gameReady = useRef(false);
    const pendingMessages = useRef<BridgeInboundMessage[]>([]);

    // The WebView's JS (and its message listener) isn't guaranteed to be
    // running yet when a screen calls loadHeroes/startBattle right after
    // mount, so commands sent before GAME_READY are queued and flushed once
    // it arrives, instead of being silently dropped.
    const send = (message: BridgeInboundMessage) => {
      if (gameReady.current) {
        webViewRef.current?.postMessage(JSON.stringify(message));
      } else {
        pendingMessages.current.push(message);
      }
    };

    useImperativeHandle(ref, () => ({
      loadHeroes: (heroes) => send({ type: "LOAD_HEROES", payload: { heroes } }),
      startFormationPhase: (durationSeconds) =>
        send({ type: "START_FORMATION_PHASE", payload: { durationSeconds } }),
      setFormation: (formations) => send({ type: "SET_FORMATION", payload: { formations } }),
      startBattle: (seed) => send({ type: "START_BATTLE", payload: { seed } }),
    }));

    const handleMessage = (event: WebViewMessageEvent) => {
      let message: BridgeOutboundMessage;
      try {
        message = JSON.parse(event.nativeEvent.data) as BridgeOutboundMessage;
      } catch {
        return;
      }

      switch (message.type) {
        case "GAME_READY":
          gameReady.current = true;
          for (const queued of pendingMessages.current) {
            webViewRef.current?.postMessage(JSON.stringify(queued));
          }
          pendingMessages.current = [];
          break;
        case "FORMATION_CONFIRMED":
          onFormationConfirmed(message.payload.formation);
          break;
        case "BATTLE_FINISHED":
          onBattleFinished(message.payload.winner, message.payload.rewards);
          break;
        case "RENDER_ERROR":
          onError?.(message.payload.message);
          break;
      }
    };

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
