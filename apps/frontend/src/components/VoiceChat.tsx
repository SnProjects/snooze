import { useState, useEffect } from 'react';
import { useMessageStore } from '../stores/message.store';
import { useChannelStore } from '../stores/channel.store';
import { useServerStore } from '../stores/server.store';
import { useAuthStore } from '../stores/auth.store';
import {
  Box,
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Avatar,
  IconButton,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import React from 'react';
import { useVoice } from '../context/VoiceContext';
import { HiPhone } from 'react-icons/hi';
import { LuPhone } from 'react-icons/lu';
import { FiPhoneOff } from 'react-icons/fi';

export function VoiceChat() {
  const { currentChannel } = useChannelStore();
  const { currentServer } = useServerStore();
  const {
    joinVoiceChannel,
    leaveVoiceChannel,
    toggleMute,
    isMuted,
    peers,
    isInVoiceChannel,
    currentChannel: connectedVoice,
  } = useVoice();

  const handleJoinVoiceChannel = () => {
    if (!currentServer) return;
    const channelId = currentChannel?.id;
    joinVoiceChannel(currentServer.id, channelId as number);
  };

  const handleLeaveVoiceChannel = () => {
    leaveVoiceChannel();
  };

  return (
    <Box
      flex={1}
      display="flex"
      flexDir="column"
      backgroundColor={'bg.muted'}
      overflowY={'auto'}
      scrollBehavior={'smooth'}
    >
      {/* Channel Header */}
      <Flex
        align="center"
        borderBottom="1px"
        borderColor="gray.200"
        pb={2}
        mb={1}
        p={5}
        // bottom shadow
        boxShadow="sm"
      >
        <Text fontSize="lg" fontWeight="bold">
          {currentChannel
            ? `# ${currentChannel.name}`
            : 'Select a server and channel'}
        </Text>
      </Flex>

      {/* Display voice peers */}
      <Flex wrap={'wrap'} p={5} flex={1}></Flex>

      {/* Join Voice Channel Button */}
      <HStack justifyContent="center" p={5}>
        {isInVoiceChannel &&
        connectedVoice?.channelId === currentChannel?.id ? (
          <IconButton
            aria-label="Leave Voice Channel"
            colorPalette={"red"}
            onClick={() => handleLeaveVoiceChannel()}
            mb={2}
            rounded={'full'}
            size={'2xl'}
          >
            <FiPhoneOff />
          </IconButton>
        ) : (
          <IconButton
            aria-label="Join Voice Channel"
            colorPalette={"whiteAlpha"}
            onClick={() => handleJoinVoiceChannel()}
            disabled={!currentChannel}
            mb={2}
            rounded={'full'}
            size={'2xl'}
          >
            <LuPhone />
          </IconButton>
        )}
      </HStack>
    </Box>
  );
}
