import { onInboundMessage, sendOutboundMessage } from "./bridge";
import { PhaserGame } from "./PhaserGame";
import { GameManager } from "./GameManager";

let readyAcked = false;

const phaserGame = new PhaserGame(() => {
  announceReady();
});

const gameManager = new GameManager(phaserGame, sendOutboundMessage);

onInboundMessage((message) => {
  if (message.type === "ACK_READY") {
    readyAcked = true;
    return;
  }
  gameManager.handleInboundMessage(message);
});

function announceReady(): void {
  if (readyAcked) return;
  sendOutboundMessage({ type: "GAME_READY" });
  setTimeout(announceReady, 400);
}
