import { Box } from '@chakra-ui/react';
import { useChannelStore } from '../../stores/channel.store';
import { useEffect } from 'react';
import LoadingOverlay from '../wrappers/LoadingOverlay';
import { Chat } from '../Chat';
import { VoiceChat } from '../VoiceChat';

export default function MiddleArea() {
  const { currentChannel } = useChannelStore();

  useEffect(() => {
    console.log('Current Channel:', currentChannel);
  }, [currentChannel]);

  if (!currentChannel) {
    return <LoadingOverlay />;
  }

  return (
    <Box flex={1} display="flex" flexDir="column" backgroundColor={'bg.muted'}>
      {currentChannel.type === 'TEXT' ? (
        <Chat />
      ) : (
        <VoiceChat />
      )}
    </Box>
  );
}
