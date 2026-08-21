import { apiFetch } from "../http/client";
import type { MatchFoundPayload } from "@battle-formation/shared-types";

export type QueueResult =
  | { status: "queued" }
  | { status: "matched"; matchId: string; match: MatchFoundPayload };
export type PvpMode = "casual" | "ranked";

export function joinQueue(mode: PvpMode = "casual"): Promise<QueueResult> {
  return apiFetch<QueueResult>("/matchmaking/queue", {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
}

export function startPractice(): Promise<QueueResult> {
  return apiFetch<QueueResult>("/matchmaking/practice", { method: "POST" });
}

export function leaveQueue(mode: PvpMode = "casual"): Promise<void> {
  return apiFetch<void>(`/matchmaking/queue?mode=${mode}`, { method: "DELETE" });
}
