import { useState } from 'react';
import { useServerStore } from '../../stores/server.store';
import { useAuthStore } from '../../stores/auth.store';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  Portal,
  Dialog,
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
  Circle,
  Tooltip as ChakraTooltip,
  Text,
  Menu,
  Avatar,
  IconButton,
  Tabs,
} from '@chakra-ui/react';
import {
  FiPlus,
  FiServer,
  FiSettings,
  FiUserPlus,
  FiGlobe,
} from 'react-icons/fi';
import ThemeSwitch from '../ui/theme-switch';
import { colorPalette } from '../../theme/colors';

export function ServerSidebar() {
  const { servers, currentServer, setCurrentServer, createServer, joinServer } =
    useServerStore();
  const { user, logout } = useAuthStore();
  const [serverName, setServerName] = useState('');
  const [serverId, setServerId] = useState('');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const handleCreateServer = async () => {
    if (!serverName.trim()) {
      setServerError('Server name cannot be empty');
      return;
    }
    try {
      await createServer(serverName);
      setServerName('');
      setServerError('');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to create server');
    }
  };

  const handleJoinServer = async () => {
    if (!serverId.trim()) {
      setServerError('Server ID cannot be empty');
      return;
    }

    try {
      await joinServer(serverId);
      setServerId('');
      setServerError('');
    } catch (err: any) {
      setServerError(err.response?.data?.message || 'Failed to join server');
    }
  };

  const handleServerDialogClose = () => {
    setServerName('');
    setServerId('');
    setServerError('');
  };

  const handleServerClick = (serverId: string) => {
    navigate(`/app/${serverId}`);
  };

  return (
    <Box w="72px" p={3} display="flex" flexDir="column" alignItems="center">
      <VStack spaceY={3}>
        {/* Server List */}
        {servers.map((server) => (
          <ChakraTooltip.Root key={server.id} placement="right">
            <ChakraTooltip.Trigger asChild>
              <Circle
                size="48px"
                bg={currentServer?.id === server.id ? 'teal.500' : 'gray.200'}
                _hover={{ bg: 'teal.400' }}
                cursor="pointer"
                onClick={() => handleServerClick(server.id)}
              >
                <FiServer size={24} />
              </Circle>
            </ChakraTooltip.Trigger>
            <Portal>
              <ChakraTooltip.Positioner>
                <ChakraTooltip.Content>
                  <ChakraTooltip.Arrow>
                    <ChakraTooltip.ArrowTip />
                  </ChakraTooltip.Arrow>
                  {server.name}
                </ChakraTooltip.Content>
              </ChakraTooltip.Positioner>
            </Portal>
          </ChakraTooltip.Root>
        ))}

        {/* Divider */}
        <Box w="32px" h="2px" bg="gray.200" />
        {/* Create/Join Server Button with Tooltip and Dialog Trigger */}
        <Dialog.Root
          placement="center"
          motionPreset="slide-in-bottom"
          onOpenChange={(details) => {
            if (!details.open) {
              handleServerDialogClose();
            }
          }}
        >
          <ChakraTooltip.Root placement="right">
            <ChakraTooltip.Trigger asChild>
              <DialogTrigger asChild>
                <Circle size="48px" cursor="pointer" overflow="hidden">
                  <IconButton
                    aria-label="Add Server"
                    variant="ghost"
                    w="100%"
                    h="100%"
                  >
                    <FiPlus size={24} />
                  </IconButton>
                </Circle>
              </DialogTrigger>
            </ChakraTooltip.Trigger>
            <Portal>
              <ChakraTooltip.Positioner>
                <ChakraTooltip.Content>
                  <ChakraTooltip.Arrow>
                    <ChakraTooltip.ArrowTip />
                  </ChakraTooltip.Arrow>
                  Create or Join a Server
                </ChakraTooltip.Content>
              </ChakraTooltip.Positioner>
            </Portal>
          </ChakraTooltip.Root>

          <Portal>
            <DialogBackdrop />
            <DialogPositioner>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Server Actions</DialogTitle>
                </DialogHeader>
                <Tabs.Root defaultValue="create">
                  <Tabs.List>
                    <Tabs.Trigger value="create">
                      <FiUserPlus />
                      Create Server
                    </Tabs.Trigger>
                    <Tabs.Trigger value="join">
                      <FiGlobe />
                      Join Server
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="create">
                    <DialogBody>
                      <Input
                        placeholder="Server name"
                        value={serverName}
                        onChange={(e) => {
                          setServerName(e.target.value);
                          setServerError('');
                        }}
                      />
                      {serverError && (
                        <Text color="red.500" mt={2}>
                          {serverError}
                        </Text>
                      )}
                    </DialogBody>
                    <DialogFooter>
                      <DialogActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogActionTrigger>
                      <Button
                        colorScheme="teal"
                        onClick={handleCreateServer}
                        ml={3}
                      >
                        Create
                      </Button>
                    </DialogFooter>
                  </Tabs.Content>
                  <Tabs.Content value="join">
                    <DialogBody>
                      <Input
                        placeholder="Server ID"
                        value={serverId}
                        onChange={(e) => {
                          setServerId(e.target.value);
                          setServerError('');
                        }}
                      />
                      {serverError && (
                        <Text color="red.500" mt={2}>
                          {serverError}
                        </Text>
                      )}
                    </DialogBody>
                    <DialogFooter>
                      <DialogActionTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogActionTrigger>
                      <Button
                        colorScheme="teal"
                        onClick={handleJoinServer}
                        ml={3}
                      >
                        Join
                      </Button>
                    </DialogFooter>
                  </Tabs.Content>
                </Tabs.Root>
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
      </VStack>

      {/* Settings and User Section */}
      <VStack spaceY={3} mt="auto">
        {/* Settings Icon */}
        <ChakraTooltip.Root placement="right">
          <ChakraTooltip.Trigger asChild>
            <Circle
              size="48px"
              cursor="pointer"
              onClick={() => navigate('/settings')}
              overflow="hidden"
            >
              <IconButton
                aria-label="Settings"
                variant="ghost"
                w="100%"
                h="100%"
              >
                <FiSettings size={24} />
              </IconButton>
            </Circle>
          </ChakraTooltip.Trigger>
          <Portal>
            <ChakraTooltip.Positioner>
              <ChakraTooltip.Content>
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
                </ChakraTooltip.Arrow>
                Settings
              </ChakraTooltip.Content>
            </ChakraTooltip.Positioner>
          </Portal>
        </ChakraTooltip.Root>

        {/* User Icon with Dropdown */}
        <Circle size="48px" cursor="pointer" overflow="hidden">
          <ThemeSwitch />
        </Circle>

        <Menu.Root>
          <Menu.Trigger asChild _focus={{ outline: 'none' }} cursor="pointer">
            <Box>
              <Avatar.Root colorPalette="teal">
                <Avatar.Fallback name={user?.username || 'User'} />
                <Avatar.Image />
              </Avatar.Root>
            </Box>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>User</Menu.ItemGroupLabel>
                  <Menu.Item>{user?.username}</Menu.Item>
                  <Menu.Item>{user?.email}</Menu.Item>
                </Menu.ItemGroup>
                <div
                  style={{ borderTop: '1px solid #E2E8F0', margin: '8px 0' }}
                />
                <Menu.ItemGroup>
                  <Menu.ItemGroupLabel>Actions</Menu.ItemGroupLabel>
                  <Menu.Item
                    value="logout"
                    color="fg.error"
                    _hover={{
                      bg: 'bg.error',
                      color: 'fg.error',
                      cursor: 'pointer',
                    }}
                    onClick={() => logout()}
                  >
                    logout
                  </Menu.Item>
                </Menu.ItemGroup>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </VStack>
    </Box>
  );
}
