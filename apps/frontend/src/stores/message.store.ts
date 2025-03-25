import { create } from 'zustand';
import { IMessage } from '@snooze/shared-types';
import { getMessages } from '../services/message.service';
import { socketService } from '../services/sockets/message.socket';
import { useAuthStore } from './auth.store';
import { useServerStore } from './server.store';
import { useChannelStore } from './channel.store';

interface MessageState {
  messages: IMessage[];
  loading: boolean;
  fetchMessages: (channelId: string, serverId: string) => Promise<void>;
  addMessage: (message: IMessage) => void;
  sendMessage: (content: string, channelId: string, serverId: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  fetchMessages: async (channelId: string, serverId: string) => {
    const accessToken = useAuthStore.getState().accessToken; // Use getState
    if (!accessToken) return;
    set({ loading: true });
    try {
      const messages = await getMessages(channelId, accessToken);
      set({ messages, loading: false });
      socketService.onMessage(serverId, channelId, (msg) => {
        const currentChannel = useChannelStore.getState().currentChannel;
        const currentServer = useServerStore.getState().currentServer;
        if (currentChannel?.id === channelId && currentServer?.id === serverId) {
          set((state) => ({ messages: [...state.messages, msg] }));
        }
      });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ loading: false });
    }
  },
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  sendMessage: (content, channelId, serverId) => {
    socketService.sendMessage(content, channelId, serverId);
  },
}));
