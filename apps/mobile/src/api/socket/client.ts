import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "../../state/authStore";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

/** Lazily connects, authenticated with the same JWT used by the REST client. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: useAuthStore.getState().token }),
    });
  }
  return socket;
}
