import { create } from 'zustand';
import { useAuthStore } from './auth.store';
import { getWhiteboards, createWhiteboard } from '../services/whiteboard.service';

interface WhiteboardState {
  whiteboards: any[];
  currentWhiteboard: any | null;
  fetchWhiteboards: (serverId: string) => Promise<void>;
  createWhiteboard: (name: string, serverId: string) => Promise<void>;
  setCurrentWhiteboard: (whiteboard: any | null) => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  whiteboards: [],
  currentWhiteboard: null,
  fetchWhiteboards: async (serverId: string) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const whiteboards = await getWhiteboards(serverId, accessToken);
      set({ whiteboards });
    } catch (error) {
      console.error('Failed to fetch whiteboards:', error);
    }
  },
  createWhiteboard: async (name: string, serverId: string) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const whiteboard = await createWhiteboard(name, serverId, accessToken);
      set((state) => ({ whiteboards: [...state.whiteboards, whiteboard] }));
    } catch (error) {
      console.error('Failed to create whiteboard:', error);
    }
  },
  setCurrentWhiteboard: (whiteboard: any | null) => set({ currentWhiteboard: whiteboard }),
}));
