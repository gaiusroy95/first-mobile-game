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

/**
 * Two hosts, same bundle: a native WebView (apps/mobile's GameContainer.tsx)
 * injects `window.ReactNativeWebView`; a browser iframe
 * (GameContainer.web.tsx) doesn't, so `window.parent.postMessage` - the
 * standard way an iframe talks back to whatever embedded it - is the
 * fallback. Neither host needs this file to know which one it is.
 */
export function sendOutboundMessage(message: BridgeOutboundMessage): void {
  const payload = JSON.stringify(message);
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(payload);
  } else if (window.parent !== window) {
    window.parent.postMessage(payload, "*");
  }
}
