import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { GAME_HTML } from "./gameBundle.generated";
import { useGameBridgeTransport } from "./useGameBridgeTransport";
import type { GameContainerHandle, GameContainerProps } from "./GameContainer.types";

export type { GameContainerHandle } from "./GameContainer.types";

/**
 * Web host: a browser doesn't need react-native-webview to embed content -
 * it already has an iframe. Same bridge protocol, same GAME_HTML, same
 * GameContainerHandle as the native file; only "how do I actually post
 * and receive a raw string" differs, and that's isolated to this file and
 * game-engine's render/bridge (sendOutboundMessage falls back to
 * `window.parent.postMessage` when it isn't hosted in a WebView).
 */
export const GameContainer = forwardRef<GameContainerHandle, GameContainerProps>(
  ({ onFormationConfirmed, onBattleFinished, onError }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const { send, handleRawMessage } = useGameBridgeTransport({
      postRaw: (raw) => iframeRef.current?.contentWindow?.postMessage(raw, "*"),
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

    useEffect(() => {
      const listener = (event: MessageEvent) => {
        if (event.source !== iframeRef.current?.contentWindow) return;
        if (typeof event.data !== "string") return;
        handleRawMessage(event.data);
      };
      window.addEventListener("message", listener);
      return () => window.removeEventListener("message", listener);
      // handleRawMessage closes over refs that don't change identity in a
      // way that should re-subscribe this listener - stable for the life
      // of the component, same as the native host's single onMessage prop.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <iframe
        ref={iframeRef}
        srcDoc={GAME_HTML}
        title="Battle Formation"
        style={{ flex: 1, border: "none", backgroundColor: "#0f172a", width: "100%", height: "100%" }}
      />
    );
  }
);

GameContainer.displayName = "GameContainer";
