import { create } from 'zustand';
import { IChannel, IServerMember, ITextChannel } from '@snooze/shared-types';
import { getTextChannels, getVoiceChannels, createChannel, getChannels } from '../services/channel.service';
import { useAuthStore } from './auth.store';
import { IFullChannel, IVoiceChannel, IWhiteboardChannel, TChannelType } from '@snooze/shared-types';

interface ChannelState {
  textChannels: ITextChannel[];
  voiceChannels: IVoiceChannel[];
  whiteboardChannels: IWhiteboardChannel[];
  voiceMembers: Map<string, string[]>;
  currentChannel: IFullChannel | null;
  allChannels: () => IChannel[];
  fetchChannels: (serverId: string) => Promise<void>;
  setCurrentChannel: (channel: IChannel | null) => void;
  createChannel: (name: string, serverId: string, type: TChannelType) => Promise<void>;
  getAllChannels: () => IChannel[];
  addVoiceMember: (channelId: string, userId: string) => void;
  removeVoiceMember: (channelId: string, userId: string) => void;
  updateVoicePeers: (channelId: string, peers: IServerMember[]) => void;
}

export const useChannelStore = create<ChannelState>((set) => ({
  textChannels: [],
  voiceChannels: [],
  whiteboardChannels: [],
  currentChannel: null,
  voiceMembers: new Map(),
  allChannels: (): IChannel[] => {
    return [...useChannelStore.getState().textChannels, ...useChannelStore.getState().voiceChannels];
  },
  fetchChannels: async (serverId: string) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const channels = await getChannels(serverId, accessToken);
      const textChannels = channels.filter((channel) => channel.type === 'TEXT') as ITextChannel[];
      const voiceChannels = channels.filter((channel) => channel.type === 'VOICE') as IVoiceChannel[];
      const whiteboardChannels = channels.filter((channel) => channel.type === 'WHITEBOARD') as IWhiteboardChannel[];
      set({ textChannels, voiceChannels, whiteboardChannels });
      if (textChannels.length > 0 && !useChannelStore.getState().currentChannel) {
        set({ currentChannel: textChannels[0] as IFullChannel });
      }
    } catch (error) {
      console.error('Failed to fetch channels:', error);
    }
  },
  setCurrentChannel: (channel) => {
    console.log('Setting current channel2:', channel);
    // if the channel is the same, don't update
    if (channel && useChannelStore.getState().currentChannel?.id === channel.id) return
    if (!channel) {
      set({ currentChannel: null });
      return;
    }
    set({ currentChannel: channel as IFullChannel });
  },
  createChannel: async (name: string, serverId: string, type: TChannelType) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) return;
    try {
      const newChannel = await createChannel(name, serverId, type, accessToken);
      if (type === 'TEXT') {
        set((state) => ({ textChannels: [...state.textChannels, newChannel as ITextChannel] }));
      } else if (type === 'VOICE') {
        set((state) => ({
          voiceChannels: [...state.voiceChannels, newChannel as IVoiceChannel],
        }));
      } else if (type === 'WHITEBOARD') {
        set((state) => ({
          whiteboardChannels: [...state.whiteboardChannels, newChannel as IWhiteboardChannel],
        }));
      }
      if (type === 'TEXT') {
        set({ currentChannel: newChannel as IFullChannel });
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
      ...useChannelStore.getState().whiteboardChannels,
    ];
  },
  addVoiceMember: (channelId, userId) => {
    const members = useChannelStore.getState().voiceMembers.get(channelId) || [];
    members.push(userId.toString());
    useChannelStore.setState({
      voiceMembers: new Map(useChannelStore.getState().voiceMembers.set(channelId, members)),
    });
  },
  removeVoiceMember: (channelId, userId) => {
    const members = useChannelStore.getState().voiceMembers.get(channelId) || [];

    const newMembers = members.filter((id) => id !== userId.toString());

    useChannelStore.setState({
      voiceMembers: new Map(useChannelStore.getState().voiceMembers.set(channelId, newMembers)),
    });
  },
  updateVoicePeers: (channelId, peers) => {
    console.log('updating voice peers', peers);
    const newChannels = useChannelStore.getState().voiceChannels.map((channel) => (channel.id === channelId ? { ...channel, peers } : channel));
    set({ voiceChannels: newChannels });

    // update current channel if it's the same
    const currentChannel = useChannelStore.getState().currentChannel;
    if (currentChannel?.id === channelId) {
      set({ currentChannel: { ...currentChannel, peers } });
    }
  },
}));
