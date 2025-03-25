import { useEffect, useRef, useState } from 'react';
import { useChannelStore } from '../../stores/channel.store';
import { useServerStore } from '../../stores/server.store';
import { useAuthStore } from '../../stores/auth.store';
import { getVoiceChannels } from '../../services/channel.service';
import {
  Box,
  VStack,
  Text,
  Avatar,
  IconButton,
  Flex,
  Badge,
  Dialog,
  Portal,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogTrigger,
  DialogActionTrigger,
  DialogCloseTrigger,
  Input,
  Button,
  CloseButton,
  Select,
  createListCollection,
  HStack,
} from '@chakra-ui/react';
import {
  FiMessageSquare,
  FiFolder,
  FiStar,
  FiCalendar,
  FiPlus,
  FiVolume2,
  FiMicOff,
  FiMic,
  FiPhone,
  FiPhoneOff,
} from 'react-icons/fi';
import { useVoice } from '../../context/VoiceContext';
import { useNavigate } from 'react-router-dom';

const channelTypes = createListCollection({
  items: [
    { label: 'TEXT', value: 'TEXT' },
    { label: 'VOICE', value: 'VOICE' },
  ],
});

export function ChannelSidebar() {
  const {
    voiceChannels,
    textChannels,
    fetchChannels,
    setCurrentChannel,
    currentChannel,
    createChannel,
  } = useChannelStore();
  const { currentServer } = useServerStore();
  const { user } = useAuthStore();
  const { toggleMute, isMuted, peers, leaveVoiceChannel, isInVoiceChannel, connectionStatus } =
    useVoice();
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState<'TEXT' | 'VOICE'>('VOICE');
  const [channelError, setChannelError] = useState('');

  const nav = useNavigate();

  useEffect(() => {
    if (currentServer) {
      fetchChannels(currentServer.id);
    } else {
      setCurrentChannel(null);
    }
  }, [currentServer, fetchChannels, setCurrentChannel]);

  const handleCreateChannel = async () => {
    if (!channelName.trim()) {
      setChannelError('Channel name cannot be empty');
      return;
    }
    if (!currentServer) {
      setChannelError('No server selected');
      return;
    }
    try {
      await createChannel(channelName, currentServer.id, channelType);
      setChannelName('');
      setChannelError('');
      setChannelType('TEXT');
    } catch (err: any) {
      setChannelError(
        err.response?.data?.message || 'Failed to create channel',
      );
    } finally {
      handleChannelDialogClose();
    }
  };

  const selectChannel = (channelId: string) => {
    nav(`/app/${currentServer?.id}/${channelId}`);
  };

  const handleChannelDialogClose = () => {
    setChannelName('');
    setChannelType('TEXT');
    setChannelError('');
  };

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <Box w="250px" overflow={'hidden'}>
      <VStack align="start" w="100%" h="100%">
        {/* Server Name */}
        <Text fontSize="lg" fontWeight="bold" w="100%" p={5} boxShadow="sm">
          {currentServer ? currentServer.name : 'Select a Server'}
        </Text>

        {/* Navigation */}
        <VStack align="start" spaceY={'0.5'} w="100%" px={5}>
          <Button w="100%" borderRadius="md" variant="ghost" paddingX={2}>
            <FiMessageSquare />
            <Text ml="2">Assistant</Text>
            <Badge ml="auto" colorScheme="pink">
              NEW
            </Badge>
          </Button>
          <Button w="100%" borderRadius="md" variant="ghost" paddingX={2}>
            <FiFolder />
            <Text ml="2" mr={'auto'}>
              Drafts
            </Text>
          </Button>
          <Button w="100%" borderRadius="md" variant="ghost" paddingX={2}>
            <FiStar />
            <Text ml="2" mr="auto">
              Saved Items
            </Text>
          </Button>
          <Button w="100%" borderRadius="md" variant="ghost" paddingX={2}>
            <FiCalendar />

            <Text ml="2">Events</Text>
            <Badge ml="auto" colorScheme="pink">
              2
            </Badge>
          </Button>
        </VStack>

        <VStack align="start" w="100%" flex={1} mt={5}>
          {/* Channels */}
          <Flex align="center" w="100%" px={5}>
            <Text fontSize="sm" fontWeight="bold">
              Channels
            </Text>
            {currentServer && (
              <Dialog.Root
                placement="center"
                motionPreset="slide-in-bottom"
                onOpenChange={(details) => {
                  if (!details.open) {
                    handleChannelDialogClose();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <IconButton
                    aria-label="Add Channel"
                    variant="ghost"
                    ml="auto"
                    size="sm"
                  >
                    <FiPlus />
                  </IconButton>
                </DialogTrigger>
                <Portal>
                  <DialogBackdrop />
                  <DialogPositioner>
                    <DialogContent ref={contentRef}>
                      <DialogHeader>
                        <DialogTitle>Create a New Channel</DialogTitle>
                      </DialogHeader>
                      <DialogBody>
                        <Input
                          placeholder="Channel name"
                          value={channelName}
                          onChange={(e) => {
                            setChannelName(e.target.value);
                            setChannelError('');
                          }}
                          mb={3}
                        />
                        <Select.Root collection={channelTypes} size="sm">
                          <Select.HiddenSelect />
                          <Select.Label>Select Type</Select.Label>
                          <Select.Control>
                            <Select.Trigger>
                              <Select.ValueText placeholder="Select Type" />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Portal container={contentRef}>
                            <Select.Positioner>
                              <Select.Content>
                                {channelTypes.items.map((item) => (
                                  <Select.Item item={item} key={item.value}>
                                    {item.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select.Positioner>
                          </Portal>
                        </Select.Root>
                        {channelError && (
                          <Text color="red.500" mt={2}>
                            {channelError}
                          </Text>
                        )}
                      </DialogBody>
                      <DialogFooter>
                        <DialogActionTrigger asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogActionTrigger>
                        <Button
                          colorScheme="teal"
                          onClick={handleCreateChannel}
                          ml={3}
                        >
                          Create
                        </Button>
                      </DialogFooter>
                      <DialogCloseTrigger asChild>
                        <CloseButton
                          size="sm"
                          position="absolute"
                          top={2}
                          right={2}
                        />
                      </DialogCloseTrigger>
                    </DialogContent>
                  </DialogPositioner>
                </Portal>
              </Dialog.Root>
            )}
          </Flex>
          <VStack align="start" w="100%" px={5}>
            {textChannels.map((channel) => (
              <Button
                key={channel.id}
                w="100%"
                borderRadius="md"
                justifyContent="flex-start"
                onClick={() => selectChannel(channel.id)}
                variant={
                  currentChannel && currentChannel.id === channel.id
                    ? 'solid'
                    : 'ghost'
                }
              >
                <Text># {channel.name}</Text>
              </Button>
            ))}
          </VStack>

          {/* Voice Channels */}
          <Flex align="center" w="100%" px={5} mt={5}>
            <Text fontSize="sm" fontWeight="bold">
              Voice Channels
            </Text>
          </Flex>
          <VStack align="start" px={5} w="100%">
            {voiceChannels.map((channel) => (
              <Button
                key={channel.id}
                w="100%"
                borderRadius="md"
                justifyContent="flex-start"
                onClick={() => selectChannel(channel.id)}
                variant={
                  currentChannel && currentChannel.id === channel.id
                    ? 'solid'
                    : 'ghost'
                }
              >
                <FiVolume2 />
                <Text>{channel.name}</Text>
                <Badge ml="auto" colorScheme="green">
                  {channel.peers?.length}
                </Badge>
              </Button>
            ))}
          </VStack>
        </VStack>

        {/* Voice Channel Controls */}
        {isInVoiceChannel && (
          <Box
            w="100%"
            h="100px"
            p={5}
            border="1px"
            borderColor="gray.200"
            backgroundColor="bg.muted"
            px={5}
            borderBottomLeftRadius={'md'}
          >
            <VStack justify="space-between" align="center" w="100%" h="100%">
              <Box>
                <Text fontSize="sm" fontWeight="bold">
                  {connectionStatus}
                </Text>
              </Box>
              <HStack>
                <IconButton
                  aria-label="Toggle Mute"
                  onClick={toggleMute}
                  size="sm"
                  rounded="full"
                >
                  {isMuted ? <FiMicOff /> : <FiMic />}
                </IconButton>

                <IconButton
                  aria-label="Leave Voice Channel"
                  onClick={() => {
                    leaveVoiceChannel();
                  }}
                  size="sm"
                  colorPalette={'red'}
                  ml={2}
                  rounded={'full'}
                >
                  <FiPhoneOff />
                </IconButton>
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
