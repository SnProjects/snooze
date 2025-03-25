import { useState, useEffect, memo, useRef } from 'react';
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
import { FiSend, FiSmile, FiMic } from 'react-icons/fi';
import React from 'react';
import { IMessage } from '@snooze/shared-types';

export type MessageItemProps = {
  msg: IMessage
};

const MessageItem = memo(({ msg }: MessageItemProps) => {
  const time = useRef(new Date(msg.createdAt).toLocaleTimeString()).current; // Compute once

  return (
    <Flex align="start" w="100%">
      {/* Simplified avatar */}
      <Avatar.Root>
        <Avatar.Fallback name={msg.username} />
        <Avatar.Image />
      </Avatar.Root>
      <Box ml={3}>
        <Flex align="center">
          <Text fontWeight="bold">{msg.username}</Text>
          <Text fontSize="xs" color="gray.500" ml={2}>
            {time}
          </Text>
        </Flex>
        <Text>{msg.content}</Text>
      </Box>
    </Flex>
  );
});

export function Chat() {
  const [input, setInput] = useState('');
  const { messages, fetchMessages, sendMessage, loading } = useMessageStore();
  const { currentChannel } = useChannelStore();
  const { currentServer } = useServerStore();
  const { logout } = useAuthStore();
  const scrollRef = React.useRef(null);

  useEffect(() => {
    if (currentServer && currentChannel) {
      fetchMessages(currentChannel.id, currentServer.id);
    }
    scrollToBottom();
  }, [currentChannel, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      var element = scrollRef.current as Element;
      element.scrollTop = element.scrollHeight;
    }
  };

  const handleSend = () => {
    if (input.trim() && currentChannel && currentServer) {
      sendMessage(input, currentChannel.id, currentServer.id);
      setInput('');
    }
  };

  return (
    <Box flex={1} display="flex" flexDir="column" backgroundColor={'bg.muted'} overflowY={'auto'} scrollBehavior={'smooth'}>
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

      {/* Messages */}
      <Box
        flex={1}
        overflowY="auto"
        p={5}
        mr={2}
        className="scrollbar"
        ref={scrollRef}
      >
        {loading ? (
          <Flex justify="center" align="center" h="100%">
            <Spinner size="lg" />
          </Flex>
        ) : (
          <VStack spaceY={4} align="start">
            {messages.map((msg) => (
              <MessageItem key={msg.id} msg={msg} />
            ))}
          </VStack>
        )}
      </Box>

      {/* Message Input */}
      <Flex px={5} pb={5} w="100%" align="center" justify="space-between">
        <HStack backgroundColor={'bg.emphasized'} borderRadius="md" w="100%" pr={2}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              currentServer && currentChannel
                ? `Message #${currentChannel.name}`
                : 'Select a server and channel'
            }
            borderRadius="md"
            disabled={!currentServer || !currentChannel}
            outline={'transparent'}
            border={'transparent'}
            background={'transparent'}
            _focus={{ borderColor: 'transparent' }}
            p={6}
          />
          <IconButton aria-label="Emoji" variant="ghost" rounded={'full'}>
            <FiSmile />
          </IconButton>
          <IconButton aria-label="Mic" variant="ghost" rounded={'full'}>
            <FiMic />
          </IconButton>
        </HStack>
        <Button
          onClick={handleSend}
          colorScheme="teal"
          disabled={!currentServer || !currentChannel}
          ml={2}
          borderRadius="md"
          h="100%"
        >
          <FiSend
            style={{
              transform: 'rotate(45deg)',
              WebkitTransform: 'rotate(45deg)',
              marginLeft: '-2px',
            }}
          />
        </Button>
      </Flex>
    </Box>
  );
}
