import { create } from "zustand";
import type {
  BattleResultPayload,
  MatchFoundPayload,
  PlayerSide,
  RosterHero,
} from "@battle-formation/shared-types";
import { connectSocket, disconnectSocket, getSocket } from "../api/socket/client";
import { joinQueue, leaveQueue, startPractice } from "../api/endpoints/matchmaking";

type QueueStatus = "idle" | "queued" | "matched" | "error";

interface MatchState {
  queueStatus: QueueStatus;
  queueError: string | null;
  matchId: string | null;
  opponentId: string | null;
  playerAId: string | null;
  playerBId: string | null;
  localSide: PlayerSide | null;
  roster: RosterHero[];
  formationDeadline: string | null;
  battleResult: BattleResultPayload | null;
  waitingForOpponent: boolean;
  isPractice: boolean;

  findMatch: (mode?: "casual" | "ranked") => Promise<void>;
  practiceMatch: () => Promise<void>;
  cancelQueue: (mode?: "casual" | "ranked") => Promise<void>;
  bindSocket: (playerId: string) => void;
  unbindSocket: () => void;
  setWaitingForOpponent: (waiting: boolean) => void;
  setBattleResult: (payload: BattleResultPayload) => void;
  clearMatch: () => void;
}

let socketBound = false;
let boundPlayerId: string | null = null;

function applyFound(payload: MatchFoundPayload, playerId: string) {
  const localSide: PlayerSide = payload.playerAId === playerId ? "playerA" : "playerB";
  return {
    queueStatus: "matched" as const,
    matchId: payload.matchId,
    opponentId: payload.opponentId,
    playerAId: payload.playerAId,
    playerBId: payload.playerBId,
    localSide,
    roster: payload.roster,
    formationDeadline: payload.formationDeadline,
    battleResult: null,
    waitingForOpponent: false,
  };
}

function attachListeners(playerId: string, set: (partial: Partial<MatchState>) => void): void {
  const socket = getSocket();
  socket.off("matchmaking:found");
  socket.off("battle:start");
  socket.off("battle:result");

  socket.on("matchmaking:found", (payload: MatchFoundPayload) => {
    set(applyFound(payload, playerId));
  });

  socket.on("battle:start", () => {
    set({ waitingForOpponent: false });
  });

  socket.on("battle:result", (payload: BattleResultPayload) => {
    set({ battleResult: payload, waitingForOpponent: false });
  });
}

export const useMatchStore = create<MatchState>((set, get) => ({
  queueStatus: "idle",
  queueError: null,
  matchId: null,
  opponentId: null,
  playerAId: null,
  playerBId: null,
  localSide: null,
  roster: [],
  formationDeadline: null,
  battleResult: null,
  waitingForOpponent: false,
  isPractice: false,

  bindSocket: (playerId) => {
    boundPlayerId = playerId;
    attachListeners(playerId, set);
    if (!socketBound || !getSocket().connected) {
      socketBound = true;
      void connectSocket().catch((error) => {
        set({
          queueError: error instanceof Error ? error.message : "Could not connect to live matches",
        });
      });
    }
  },

  unbindSocket: () => {
    disconnectSocket();
    socketBound = false;
    boundPlayerId = null;
  },

  findMatch: async (mode: "casual" | "ranked" = "casual") => {
    if (get().queueStatus === "queued") return;
    set({ queueStatus: "queued", queueError: null, battleResult: null, isPractice: false });
    try {
      await connectSocket();
      if (boundPlayerId) attachListeners(boundPlayerId, set);
      const result = await joinQueue(mode);
      if (result.status === "matched" && result.match && boundPlayerId) {
        set({ ...applyFound(result.match, boundPlayerId), isPractice: false });
      }
    } catch (error) {
      set({
        queueStatus: "error",
        queueError: error instanceof Error ? error.message : "Failed to join queue",
      });
    }
  },

  practiceMatch: async () => {
    if (get().queueStatus === "queued") return;
    set({ queueStatus: "queued", queueError: null, battleResult: null, isPractice: true });
    try {
      await connectSocket();
      if (boundPlayerId) attachListeners(boundPlayerId, set);
      const result = await startPractice();
      if (result.status === "matched" && result.match && boundPlayerId) {
        set({ ...applyFound(result.match, boundPlayerId), isPractice: true });
      }
    } catch (error) {
      set({
        queueStatus: "error",
        queueError: error instanceof Error ? error.message : "Failed to start practice",
        isPractice: false,
      });
    }
  },

  cancelQueue: async (mode: "casual" | "ranked" = "casual") => {
    try {
      await leaveQueue(mode);
    } catch {
      /* ignore */
    }
    set({ queueStatus: "idle", queueError: null, isPractice: false });
  },

  setWaitingForOpponent: (waiting) => set({ waitingForOpponent: waiting }),

  setBattleResult: (payload) => {
    const current = get().battleResult;
    if (current?.matchId === payload.matchId && current.events.length > 0) return;
    set({ battleResult: payload, waitingForOpponent: false });
  },

  clearMatch: () =>
    set({
      queueStatus: "idle",
      matchId: null,
      opponentId: null,
      playerAId: null,
      playerBId: null,
      localSide: null,
      roster: [],
      formationDeadline: null,
      battleResult: null,
      waitingForOpponent: false,
      isPractice: false,
    }),
}));
