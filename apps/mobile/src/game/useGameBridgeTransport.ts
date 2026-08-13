import { useRef } from "react";
import type { BridgeInboundMessage, BridgeOutboundMessage } from "@battle-formation/shared-types";
import type { GameContainerProps } from "./GameContainer.types";

interface UseGameBridgeTransportArgs extends GameContainerProps {
  /** However the host actually delivers a raw string to the Phaser bundle - postMessage on a WebView ref, or on an iframe's contentWindow. */
  postRaw: (raw: string) => void;
}

/**
 * The bridge protocol itself (queue-until-ready, decode, dispatch) shared
 * between the native (WebView) and web (iframe) hosts - GameContainer.tsx
 * and GameContainer.web.tsx each only implement "how do I actually post
 * and receive a raw string" and hand both directions through here, so the
 * two hosts can never drift on what a given bridge message means.
 */
export function useGameBridgeTransport({ postRaw, onFormationConfirmed, onBattleFinished, onError }: UseGameBridgeTransportArgs) {
  const gameReady = useRef(false);
  const pendingMessages = useRef<BridgeInboundMessage[]>([]);

  const send = (message: BridgeInboundMessage) => {
    if (gameReady.current) {
      postRaw(JSON.stringify(message));
    } else {
      pendingMessages.current.push(message);
    }
  };

  const handleRawMessage = (raw: string) => {
    let message: BridgeOutboundMessage;
    try {
      message = JSON.parse(raw) as BridgeOutboundMessage;
    } catch {
      return;
    }

    switch (message.type) {
      case "GAME_READY":
        if (!gameReady.current) {
          gameReady.current = true;
          postRaw(JSON.stringify({ type: "ACK_READY" }));
          for (const queued of pendingMessages.current) {
            postRaw(JSON.stringify(queued));
          }
          pendingMessages.current = [];
        }
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

  return { send, handleRawMessage };
}
