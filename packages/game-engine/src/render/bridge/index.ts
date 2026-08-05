import type { BridgeInboundMessage, BridgeOutboundMessage } from "@battle-formation/shared-types";

type InboundHandler = (message: BridgeInboundMessage) => void;

declare global {
  interface Window {
    ReactNativeWebView?: { postMessage: (message: string) => void };
  }
}

/**
 * WebView message events fire on `document` on Android and on `window` on
 * iOS - registering both is the standard workaround for that inconsistency.
 */
export function onInboundMessage(handler: InboundHandler): void {
  const listener = (event: MessageEvent<string>) => {
    try {
      const message = JSON.parse(event.data) as BridgeInboundMessage;
      handler(message);
    } catch {
      // Ignore malformed/foreign messages rather than crashing the game loop.
    }
  };
  window.addEventListener("message", listener as EventListener);
  document.addEventListener("message", listener as EventListener);
}

export function sendOutboundMessage(message: BridgeOutboundMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message));
}
