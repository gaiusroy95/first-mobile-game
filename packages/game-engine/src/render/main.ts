import { onInboundMessage, sendOutboundMessage } from "./bridge";
import { PhaserGame } from "./PhaserGame";
import { GameManager } from "./GameManager";

const phaserGame = new PhaserGame(() => {
  sendOutboundMessage({ type: "GAME_READY" });
});

const gameManager = new GameManager(phaserGame, sendOutboundMessage);

onInboundMessage((message) => gameManager.handleInboundMessage(message));
