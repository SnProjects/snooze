import { create } from 'zustand';
import { Channel } from '@snooze/shared-types';
import {
  getTextChannels,
  getVoiceChannels,
  createChannel,
} from '../services/channel.service';
import { useAuthStore } from './auth.store';

interface ChannelState {
  textChannels: Channel[];
  voiceChannels: Channel[];
  voiceMembers: Map<number, string[]>;
  currentChannel: Channel | null;
  allChannels: () => Channel[];
  fetchChannels: (serverId: number) => Promise<void>;
  setCurrentChannel: (channel: Channel | null) => void;
  createChannel: (
    name: string,
    serverId: number,
    type: 'TEXT' | 'VOICE',
  ) => Promise<void>;
  getAllChannels: () => Channel[];
  addVoiceMember: (channelId: number, userId: number) => void;
  removeVoiceMember: (channelId: number, userId: number) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  textChannels: [],
  voiceChannels: [],
  currentChannel: null,
  voiceMembers: new Map(),
  allChannels: (): Channel[] => {
    return [
      ...useChannelStore.getState().textChannels,
      ...useChannelStore.getState().voiceChannels,
    ];
  },
  fetchChannels: async (serverId: number) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const textChannels = await getTextChannels(serverId, accessToken);
      const voiceChannels = await getVoiceChannels(serverId, accessToken);
      set({ textChannels, voiceChannels });
      if (
        textChannels.length > 0 &&
        !useChannelStore.getState().currentChannel
      ) {
        set({ currentChannel: textChannels[0] });
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  },
  setCurrentChannel: (channel) => set({ currentChannel: channel }),
  createChannel: async (
    name: string,
    serverId: number,
    type: 'TEXT' | 'VOICE',
  ) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const newChannel = await createChannel(name, serverId, type, accessToken);
      if (type === 'TEXT') {
        set((state) => ({ textChannels: [...state.textChannels, newChannel] }));
      } else {
        set((state) => ({
          voiceChannels: [...state.voiceChannels, newChannel],
        }));
      }
      if (type === 'TEXT') {
        set({ currentChannel: newChannel });
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
      throw error;
    }
  },
  getAllChannels: (): Channel[] => {
    return [
      ...useChannelStore.getState().textChannels,
      ...useChannelStore.getState().voiceChannels,
    ];
  },
  addVoiceMember: (channelId, userId) => {
    const members =
      useChannelStore.getState().voiceMembers.get(channelId) || [];
    members.push(userId.toString());
    useChannelStore.setState({
      voiceMembers: new Map(
        useChannelStore.getState().voiceMembers.set(channelId, members),
      ),
    });
  },
  removeVoiceMember: (channelId, userId) => {
    const members =
      useChannelStore.getState().voiceMembers.get(channelId) || [];
    const newMembers = members.filter((id) => id !== userId.toString());
    useChannelStore.setState({
      voiceMembers: new Map(
        useChannelStore.getState().voiceMembers.set(channelId, newMembers),
      ),
    });
  },
}));
