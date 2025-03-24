import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { useAuthStore } from '../stores/auth.store';
import { getUsersInServer } from '../services/server.service';
import { voiceHost } from '../services/apiClient';
import { useChannelStore } from '../stores';
import AudioPlayer from '../components/AudioPlayer';

interface VoiceContextType {
  joinVoiceChannel: (serverId: number, channelId: number) => void;
  leaveVoiceChannel: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  peers: { userId: number; username: string; stream: MediaStream }[];
  connectionStatus: string;
  isInVoiceChannel: boolean; // New: Indicates if the user is in a voice channel
  currentChannel: { serverId: number; channelId: number } | null;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, accessToken } = useAuthStore();
  const {} = useChannelStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peers, setPeers] = useState<
    { userId: number; username: string; stream: MediaStream }[]
  >([]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentChannel, setCurrentChannel] = useState<{
    serverId: number;
    channelId: number;
  } | null>(null);
  const [serverMembers, setServerMembers] = useState<
    { id: number; username: string }[]
  >([]);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const userStream = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<number, Peer.Instance>>(new Map());

  // Compute whether the user is in a voice channel
  const isInVoiceChannel = currentChannel !== null;

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const newSocket = io(voiceHost, {
      auth: { token: accessToken },
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      leaveVoiceChannel(); // Ensure cleanup on unmount
    };
  }, [accessToken]);

  // Start audio stream when joining a channel
  const startAudioStream = async () => {
    try {
      setConnectionStatus('Connecting...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      userStream.current = stream;
      // Updated status after getting media stream
    } catch (error) {
      console.error('Failed to get user media:', error);
      setConnectionStatus('Disconnected');
    }
  };

  // Stop audio stream when leaving a channel
  const stopAudioStream = () => {
    if (userStream.current) {
      userStream.current.getTracks().forEach((track) => track.stop());
      userStream.current = null;
    }
  };

  // Handle socket events and peer connections
  useEffect(() => {
    if (!socket || !user) return;

    // Fetch server members when joining a channel
    const fetchMembers = async () => {
      if (currentChannel && accessToken) {
        try {
          const members = await getUsersInServer(
            currentChannel.serverId,
            accessToken,
          );
          setServerMembers(members);
        } catch (error) {
          console.error('Failed to fetch server members:', error);
        }
      }
    };
    fetchMembers();

    socket.on('user-joined', ({ userId }: { userId: number }) => {
      if (userId === user.id || !userStream.current || !currentChannel) return;
      // Update status to indicate initiating a peer connection
      setConnectionStatus('Connected');
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: userStream.current,
        config: {
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        },
      });

      peer.on('signal', (data) => {
        socket.emit('offer', {
          serverId: currentChannel.serverId,
          channelId: currentChannel.channelId,
          offer: data,
          fromUserId: user.id,
          toUserId: userId,
        });
        setConnectionStatus('Offering');
      });

      peer.on('stream', (stream) => {
        const username =
          serverMembers.find((member) => member.id === userId)?.username ||
          `User ${userId}`;
        setPeers((prev) => [...prev, { userId, username, stream }]);
        // Now that audio is received from peer, update status
        setConnectionStatus('Connected');
      });

      peer.on('error', (err) => {
        console.error(`Peer error with user ${userId}:`, err);
        setConnectionStatus('Disconnected');
      });

      peersRef.current.set(userId, peer);
    });

    socket.on('user-left', ({ userId }: { userId: number }) => {
      const peer = peersRef.current.get(userId);
      if (peer) {
        peer.destroy();
        peersRef.current.delete(userId);
        setPeers((prev) => prev.filter((p) => p.userId !== userId));
      }
      if (peersRef.current.size === 0) {
        setConnectionStatus('Connected'); // Still connected to channel, but no peers
      }
    });

    socket.on(
      'offer',
      ({
        offer,
        fromUserId,
        toUserId,
      }: {
        offer: any;
        fromUserId: number;
        toUserId: number;
      }) => {
        if (toUserId !== user.id || !userStream.current || !currentChannel)
          return;
        // Update status to indicate receiving a call
        setConnectionStatus('Receiving call...');
        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: userStream.current,
        });

        peer.on('signal', (data) => {
          socket.emit('answer', {
            serverId: currentChannel.serverId,
            channelId: currentChannel.channelId,
            answer: data,
            fromUserId: user.id,
            toUserId: fromUserId,
          });
        });

        peer.on('stream', (stream) => {
          const username =
            serverMembers.find((member) => member.id === fromUserId)
              ?.username || `User ${fromUserId}`;
          setPeers((prev) => [
            ...prev,
            { userId: fromUserId, username, stream },
          ]);
          // Update status when peer's audio is active
          setConnectionStatus('Connected');
        });

        peer.on('error', (err) => {
          console.error(`Peer error with user ${fromUserId}:`, err);
          setConnectionStatus('Disconnected');
        });

        peer.signal(offer);
        peersRef.current.set(fromUserId, peer);
      },
    );

    socket.on(
      'answer',
      ({
        answer,
        fromUserId,
        toUserId,
      }: {
        answer: any;
        fromUserId: number;
        toUserId: number;
      }) => {
        if (toUserId !== user.id) return;
        const peer = peersRef.current.get(fromUserId);
        if (peer) {
          peer.signal(answer);
          // Once answered, assume connection is active
          setConnectionStatus('Connected');
        }
      },
    );

    socket.on(
      'ice-candidate',
      ({
        candidate,
        fromUserId,
        toUserId,
      }: {
        candidate: any;
        fromUserId: number;
        toUserId: number;
      }) => {
        if (toUserId !== user.id) return;
        const peer = peersRef.current.get(fromUserId);
        if (peer) {
          peer.signal(candidate);
        }
      },
    );

    return () => {
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
    };
  }, [socket, user, currentChannel, accessToken]);

  const joinVoiceChannel = (serverId: number, channelId: number) => {
    if (!socket || !user) return;
    setCurrentChannel({ serverId, channelId });
    // Updated status
    setConnectionStatus('Connecting...');
    startAudioStream();
    console.log('Joining voice channel', serverId, channelId);
    socket.emit('join-voice-channel', { serverId, channelId, userId: user.id });
  };

  const leaveVoiceChannel = () => {
    if (!socket || !user || !currentChannel) return;
    socket.emit('leave-voice-channel', {
      serverId: currentChannel.serverId,
      channelId: currentChannel.channelId,
      userId: user.id,
    });
    setCurrentChannel(null);
    setPeers([]);
    peersRef.current.forEach((peer) => peer.destroy());
    peersRef.current.clear();
    stopAudioStream();
    setConnectionStatus('Disconnected');
  };

  const toggleMute = () => {
    if (userStream.current) {
      userStream.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  };

  return (
    <VoiceContext.Provider
      value={{
        joinVoiceChannel,
        leaveVoiceChannel,
        toggleMute,
        isMuted,
        peers,
        connectionStatus,
        isInVoiceChannel, // Expose whether the user is in a voice channel
        currentChannel,
      }}
    >
      {children}

      {/* Audio element to hear other users */}
      {peers.map((peer) => (
        <AudioPlayer key={peer.userId} stream={peer.stream} />
      ))}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
