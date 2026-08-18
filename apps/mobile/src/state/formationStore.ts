import { create } from "zustand";
import type { FactionId } from "@battle-formation/shared-types";
import { UNIT_COUNT, SQUAD_SIZE } from "@battle-formation/game-engine";

export { SQUAD_SIZE, UNIT_COUNT };

interface FormationState {
  commanderInstanceId: string | null;
  allyFaction: FactionId | null;
  selectedUnitIds: string[];
  selectedInstanceIds: string[];
  selectCommander: (instanceId: string, commanderFaction: FactionId) => void;
  setAllyFaction: (faction: FactionId) => void;
  toggleUnit: (instanceId: string, unitFaction: FactionId) => void;
  hydrate: (commanderInstanceId: string, allyFaction: FactionId, unitIds: string[]) => void;
  clear: () => void;
}

function withSquad(state: Omit<FormationState, "selectedInstanceIds"> & { selectedInstanceIds?: string[] }): FormationState["selectedInstanceIds"] {
  return state.commanderInstanceId ? [state.commanderInstanceId, ...state.selectedUnitIds] : [];
}

export const useFormationStore = create<FormationState>((set) => ({
  commanderInstanceId: null,
  allyFaction: null,
  selectedUnitIds: [],
  selectedInstanceIds: [],
  selectCommander: (instanceId, commanderFaction) =>
    set((state) => {
      const allyFaction = state.allyFaction === commanderFaction ? null : state.allyFaction;
      const next = {
        ...state,
        commanderInstanceId: instanceId,
        allyFaction,
        selectedUnitIds: [],
      };
      return { ...next, selectedInstanceIds: withSquad(next) };
    }),
  setAllyFaction: (faction) =>
    set((state) => {
      const next = { ...state, allyFaction: faction, selectedUnitIds: [] };
      return { ...next, selectedInstanceIds: withSquad(next) };
    }),
  toggleUnit: (instanceId, unitFaction) =>
    set((state) => {
      if (!state.commanderInstanceId || !state.allyFaction) return state;
      if (state.selectedUnitIds.includes(instanceId)) {
        const next = {
          ...state,
          selectedUnitIds: state.selectedUnitIds.filter((id) => id !== instanceId),
        };
        return { ...next, selectedInstanceIds: withSquad(next) };
      }
      if (state.selectedUnitIds.length >= UNIT_COUNT) return state;
      const next = { ...state, selectedUnitIds: [...state.selectedUnitIds, instanceId] };
      void unitFaction;
      return { ...next, selectedInstanceIds: withSquad(next) };
    }),
  hydrate: (commanderInstanceId, allyFaction, unitIds) =>
    set({
      commanderInstanceId,
      allyFaction,
      selectedUnitIds: unitIds,
      selectedInstanceIds: [commanderInstanceId, ...unitIds],
    }),
  clear: () =>
    set({
      commanderInstanceId: null,
      allyFaction: null,
      selectedUnitIds: [],
      selectedInstanceIds: [],
    }),
}));
