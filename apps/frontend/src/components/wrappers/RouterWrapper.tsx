import React, { createContext, useContext, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useChannelStore, useServerStore } from '../../stores';
import LoadingOverlay from './LoadingOverlay';

interface RouterContextProps {
  serverId: string | null;
  channelId: string | null;
}

const RouterContext = createContext<RouterContextProps | undefined>(undefined);

interface RouterWrapperProps {
  children: React.ReactNode;
}

export const RouterWrapper: React.FC<RouterWrapperProps> = ({ children }) => {
  const { serverId, channelId } = useParams<{
    serverId: string;
    channelId: string;
  }>();
  const { servers, currentServer, setCurrentServer } = useServerStore();
  const {
    textChannels,
    fetchChannels,
    currentChannel,
    setCurrentChannel,
    getAllChannels,
  } = useChannelStore();
  const [loading, setLoading] = React.useState(true);
  const nav = useNavigate();

  useEffect(() => {
    Validate();
  }, [serverId, channelId, servers]);

  async function Validate() {
    // if the user is not in any servers
    if (!serverId && servers.length <= 0) {
      setLoading(false);
      return;
    }

    // if the serverid is not valid
    if (!serverId) {
      const server = servers[0];
      await setCurrentServer(server);
      if (currentChannel) {
        nav(`/app/${server.id}/${currentChannel.id}`);
      } else {
        if (textChannels.length <= 0) {
          await fetchChannels(server.id);
        }
        let channel = getAllChannels()[0];
        nav(`/app/${server.id}/${channel.id}`);
      }

      return;
    }

    // if the serverid is valid, but the user is not in the server
    if (serverId) {
      const server = servers.find((s) => s.id === Number(serverId));
      if (!server) {
        nav('/app');
        return;
      }
      await setCurrentServer(server);
    }

    const channels = getAllChannels();

    // if the channelId is not valid
    if (!channelId) {
      if (channels.length > 0) {
        const channel = channels[0];
        if (channel.serverId === Number(serverId)) {
          nav(`/app/${serverId}/${channels[0].id}`);
          return;
        } else {
          // fetch the first channel in the server
          await fetchChannels(Number(serverId));
          const channel = channels[0];
          if (channel) {
            nav(`/app/${serverId}/${channel.id}`);
            return;
          }
        }

        return;
      }
    }

    // if the channelId is valid, but the channel is not in the server
    if (channelId) {
      const channel = channels.find((c) => c.id === Number(channelId));
      if (!channel && channels.length > 0) {
        const channel = channels[0];
        nav(`/app/${serverId}/${channel.id}`);
        return;
      }
    }

    // check if the server is different from the current server
    if (currentServer && currentServer.id !== Number(serverId)) {
      const server = servers.find((s) => s.id === Number(serverId));
      if (server) {
        await setCurrentServer(server);
      }
    }

    // check if the channel is different from the current channel
    if (currentChannel && currentChannel.id !== Number(channelId)) {
      const channel = channels.find((c) => c.id === Number(channelId));
      if (channel) {
        await setCurrentChannel(channel);
      }
    }

    setLoading(false);
  }

  const contextValue: RouterContextProps = {
    serverId: serverId || null,
    channelId: channelId || null,
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouterContext = (): RouterContextProps => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouterContext must be used within a RouterWrapper');
  }
  return context;
};
