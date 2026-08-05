import { create } from "zustand";

export const SQUAD_SIZE = 6;

/**
 * Which owned hero instances the player has chosen to bring into the next
 * battle - picked on the Formation Setup screen. This is deliberately just
 * a list of instanceIds, not slot positions: *where* each hero stands is
 * decided interactively inside Phaser (see FormationScene/PositionManager)
 * and never touches React Native state, keeping Phaser fully separated
 * from the RN UI. BattleScreen reads this list to know which heroes to
 * hand to GameContainer.loadHeroes.
 */
interface FormationState {
  selectedInstanceIds: string[];
  toggle: (instanceId: string) => void;
  clear: () => void;
}

export const useFormationStore = create<FormationState>((set) => ({
  selectedInstanceIds: [],
  toggle: (instanceId) =>
    set((state) => {
      if (state.selectedInstanceIds.includes(instanceId)) {
        return { selectedInstanceIds: state.selectedInstanceIds.filter((id) => id !== instanceId) };
      }
      if (state.selectedInstanceIds.length >= SQUAD_SIZE) return state;
      return { selectedInstanceIds: [...state.selectedInstanceIds, instanceId] };
    }),
  clear: () => set({ selectedInstanceIds: [] }),
}));
