import { create } from "zustand";

interface LayoutState {
  showChatPane: boolean;
  showFileTree: boolean;
  toggleChatPane: () => void;
  toggleFileTree: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  showChatPane: true,
  showFileTree: true,
  toggleChatPane: () => set((state) => ({ showChatPane: !state.showChatPane })),
  toggleFileTree: () => set((state) => ({ showFileTree: !state.showFileTree })),
}));
