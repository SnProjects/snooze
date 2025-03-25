import { create } from 'zustand';
import { IChannel, IServerMember } from '@snooze/shared-types';
import {
  getTextChannels,
  getVoiceChannels,
  createChannel,
} from '../services/channel.service';
import { useAuthStore } from './auth.store';

interface ChannelState {
  textChannels: IChannel[];
  voiceChannels: IChannel[];
  voiceMembers: Map<string, string[]>;
  currentChannel: IChannel | null;
  allChannels: () => IChannel[];
  fetchChannels: (serverId: string) => Promise<void>;
  setCurrentChannel: (channel: IChannel | null) => void;
  createChannel: (
    name: string,
    serverId: string,
    type: 'TEXT' | 'VOICE',
  ) => Promise<void>;
  getAllChannels: () => IChannel[];
  addVoiceMember: (channelId: string, userId: string) => void;
  removeVoiceMember: (channelId: string, userId: string) => void;
  updateVoicePeers: (channelId: string, peers: IServerMember[]) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  textChannels: [],
  voiceChannels: [],
  currentChannel: null,
  voiceMembers: new Map(),
  allChannels: (): IChannel[] => {
    return [
      ...useChannelStore.getState().textChannels,
      ...useChannelStore.getState().voiceChannels,
    ];
  },
  fetchChannels: async (serverId: string) => {
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
    serverId: string,
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
  getAllChannels: (): IChannel[] => {
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
  updateVoicePeers: (channelId, peers) => {
    console.log('updating voice peers', peers);
    const newChannels = useChannelStore
      .getState()
      .voiceChannels.map((channel) =>
        channel.id === channelId ? { ...channel, peers } : channel,
      );
    set({ voiceChannels: newChannels });

    // update current channel if it's the same
    const currentChannel = useChannelStore.getState().currentChannel;
    if (currentChannel?.id === channelId) {
      set({ currentChannel: { ...currentChannel, peers } });
    }
  },
}));
