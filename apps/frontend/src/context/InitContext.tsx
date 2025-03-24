// /d:/Coding/Web Development/My Projects/snooze/apps/frontend/src/contexts/InitContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { useChannelStore } from '../stores/channel.store';
import { useMessageStore } from '../stores/message.store';
import { useServerStore } from '../stores/server.store';

interface InitContextProps {
  loading: boolean;
}

const InitContext = createContext<InitContextProps | undefined>(undefined);

interface InitProviderProps {
  children: React.ReactNode;
}

export const InitProvider: React.FC<InitProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [canRefresh, setCanRefresh] = useState(false);
  const { user, initializeAuth, refreshAccessToken } = useAuthStore();
  const { fetchServers, currentServer } = useServerStore();
  const { fetchChannels, currentChannel } = useChannelStore();
  const { fetchMessages } = useMessageStore();

  useEffect(() => {
    // Initialize auth
    init();
  }, []);

  useEffect(() => {
    // If user is logged in, set canRefresh to true
    if (canRefresh) {
      initializeApp(user !== null);
    }
  }, [user]);

  const init = async () => {
    const status = await initializeAuth();
    initializeApp(status);
  };

  const initializeApp = async (status: boolean) => {
    // If auth is successful, refresh servers, channels, and messages
    if (status) {
      await fetchServers();
      if (currentServer) {
        await fetchChannels(currentServer.id);
        if (currentChannel) {
          await fetchMessages(currentChannel.id, currentServer.id);
        }
      }

      // Refresh access token every 5 minutes
      setInterval(refreshAccessToken, 5 * 60 * 1000);
    }

    setLoading(false);
    setCanRefresh(true);
  };

  return (
    <InitContext.Provider value={{ loading }}>{children}</InitContext.Provider>
  );
};

export const useInitContext = () => {
  const context = useContext(InitContext);
  if (context === undefined) {
    throw new Error('useInitContext must be used within an InitProvider');
  }
  return context;
};
