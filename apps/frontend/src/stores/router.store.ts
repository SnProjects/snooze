import { create } from 'zustand';
import { useParams } from 'react-router-dom';
import React from 'react';

interface RouterStore {
  channelId: string | undefined;
  setChannelId: (id: string | undefined) => void;
}

export const useRouterStore = create<RouterStore>((set) => ({
  channelId: undefined,
  setChannelId: (id) => set({ channelId: id }),
}));

export const useChannelId = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const setChannelId = useRouterStore((state) => state.setChannelId);

  React.useEffect(() => {
    setChannelId(channelId);
  }, [channelId, setChannelId]);

  return channelId;
};
