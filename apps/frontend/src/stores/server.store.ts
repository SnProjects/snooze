import { create } from 'zustand';
import { IServer, IServerMember } from '@snooze/shared-types';
import {
  getServers,
  createServer,
  joinServer,
} from '../services/server.service';
import { useAuthStore } from './auth.store';
import { useChannelStore } from './channel.store';

interface ServerState {
  servers: IServer[];
  currentServer: IServer | null;
  fetchServers: () => Promise<void>;
  createServer: (name: string) => Promise<void>;
  joinServer: (serverId: string) => Promise<void>;
  setCurrentServer: (server: IServer) => Promise<void>;
  members: IServerMember[];
}

export const useServerStore = create<ServerState>((set) => ({
  servers: [],
  currentServer: null,
  members: [],
  fetchServers: async () => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const servers = await getServers(accessToken);
      set({ servers });
      if (servers.length > 0 && !useServerStore.getState().currentServer) {
        // load channels for the first server
        await useChannelStore.getState().fetchChannels(servers[0].id);

        set({ currentServer: servers[0] });
      }
    } catch (error) {
      console.error('Failed to fetch servers:', error);
    }
  },
  createServer: async (name: string) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const newServer = await createServer(name, accessToken);
      set((state) => ({ servers: [...state.servers, newServer] }));
      set({ currentServer: newServer });
    } catch (error) {
      console.error('Failed to create server:', error);
      throw error;
    }
  },
  joinServer: async (serverId: string) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const joinedServer = await joinServer(serverId, accessToken);
      set((state) => ({ servers: [...state.servers, joinedServer] }));
      set({ currentServer: joinedServer });
    } catch (error) {
      console.error('Failed to join server:', error);
      throw error;
    }
  },
  setCurrentServer: async (server) => {

    if (server.id === useServerStore.getState().currentServer?.id) return;

    set({ currentServer: server });
    await useChannelStore.getState().fetchChannels(server.id);
  },
}));
