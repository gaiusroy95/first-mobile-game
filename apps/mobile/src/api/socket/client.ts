import { io, type Socket } from "socket.io-client";
import { getAuthToken } from "../session";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

/** Lazily connects, authenticated with the same JWT used by the REST client. */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: (cb) => cb({ token: getAuthToken() }),
    });
  }
  return socket;
}

export function connectSocket(): Promise<Socket> {
  const current = getSocket();
  if (current.connected) return Promise.resolve(current);

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      current.off("connect", onConnect);
      current.off("connect_error", onError);
      reject(new Error("Could not reach the game server. Check EXPO_PUBLIC_SOCKET_URL."));
    }, 8000);

    const onConnect = () => {
      clearTimeout(timeout);
      current.off("connect_error", onError);
      resolve(current);
    };
    const onError = (error: Error) => {
      clearTimeout(timeout);
      current.off("connect", onConnect);
      reject(error);
    };

    current.once("connect", onConnect);
    current.once("connect_error", onError);
    current.connect();
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}
