import { create } from 'zustand';
import { Message } from '@snooze/shared-types';
import { getMessages } from '../services/message.service';
import { socketService } from '../services/socket';
import { useAuthStore } from './auth.store';
import { useServerStore } from './server.store';
import { useChannelStore } from './channel.store';

interface MessageState {
  messages: Message[];
  loading: boolean;
  fetchMessages: (channelId: number, serverId: number) => Promise<void>;
  addMessage: (message: Message) => void;
  sendMessage: (content: string, channelId: number, serverId: number) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  fetchMessages: async (channelId: number, serverId: number) => {
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
