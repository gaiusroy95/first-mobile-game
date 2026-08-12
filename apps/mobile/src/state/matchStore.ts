import { create } from "zustand";
import type {
  BattleResultPayload,
  MatchFoundPayload,
  PlayerSide,
  RosterHero,
} from "@battle-formation/shared-types";
import { getSocket } from "../api/socket/client";
import { joinQueue, leaveQueue } from "../api/endpoints/matchmaking";

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

  findMatch: (mode?: "casual" | "ranked") => Promise<void>;
  cancelQueue: (mode?: "casual" | "ranked") => Promise<void>;
  bindSocket: (playerId: string) => void;
  unbindSocket: () => void;
  setWaitingForOpponent: (waiting: boolean) => void;
  clearMatch: () => void;
}

let socketBound = false;

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

  bindSocket: (playerId) => {
    const socket = getSocket();
    if (!socketBound) {
      socket.connect();
      socketBound = true;
    }

    socket.off("matchmaking:found");
    socket.off("battle:start");
    socket.off("battle:result");

    socket.on("matchmaking:found", (payload: MatchFoundPayload) => {
      const localSide: PlayerSide = payload.playerAId === playerId ? "playerA" : "playerB";
      set({
        queueStatus: "matched",
        matchId: payload.matchId,
        opponentId: payload.opponentId,
        playerAId: payload.playerAId,
        playerBId: payload.playerBId,
        localSide,
        roster: payload.roster,
        formationDeadline: payload.formationDeadline,
        battleResult: null,
        waitingForOpponent: false,
      });
    });

    socket.on("battle:start", () => {
      set({ waitingForOpponent: false });
    });

    socket.on("battle:result", (payload: BattleResultPayload) => {
      set({ battleResult: payload, waitingForOpponent: false });
    });
  },

  unbindSocket: () => {
    const socket = getSocket();
    socket.off("matchmaking:found");
    socket.off("battle:start");
    socket.off("battle:result");
    socket.disconnect();
    socketBound = false;
  },

  findMatch: async (mode: "casual" | "ranked" = "casual") => {
    set({ queueStatus: "queued", queueError: null, battleResult: null });
    try {
      const result = await joinQueue(mode);
      if (result.status === "matched") {
        set({ queueStatus: "matched", matchId: result.matchId });
      }
    } catch (error) {
      set({
        queueStatus: "error",
        queueError: error instanceof Error ? error.message : "Failed to join queue",
      });
    }
  },

  cancelQueue: async (mode: "casual" | "ranked" = "casual") => {
    try {
      await leaveQueue(mode);
    } catch {
      /* ignore */
    }
    set({ queueStatus: "idle", queueError: null });
  },

  setWaitingForOpponent: (waiting) => set({ waitingForOpponent: waiting }),

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
    }),
}));
