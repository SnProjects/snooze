import { useEffect, useState } from 'react';
import { useServerStore } from '../../stores/server.store';
import { Box, VStack, Text, Avatar, Badge, Flex } from '@chakra-ui/react';
import { getUsersInServer } from '../../services/server.service';
import { useAuthStore } from '../../stores/auth.store';

interface ServerMember {
  id: number;
  username: string;
  role: string;
}

export function RightPanel() {
  const { currentServer } = useServerStore();
  const { accessToken } = useAuthStore();
  const [members, setMembers] = useState<ServerMember[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (currentServer && accessToken) {
        try {
          const serverMembers = await getUsersInServer(
            currentServer.id,
            accessToken,
          );
          setMembers(serverMembers);
        } catch (error) {
          console.error('Failed to fetch server members:', error);
        }
      }
    };
    fetchMembers();
  }, [currentServer, accessToken]);

  if (!currentServer) {
    return (
      <Box w="300px" borderLeft="1px" borderColor="gray.200" p={4}>
        <Text>Select a server to view details.</Text>
      </Box>
    );
  }

  return (
    <Box w="300px" borderLeft="1px" borderColor="gray.200" p={5}>
      <VStack align="start" spaceY={6}>
        {/* Main Info */}
        <Box w="100%">
          <Text fontSize="sm" fontWeight="bold">
            Main Info
          </Text>
          <VStack align="start" spaceY={2} mt={2}>
            <Flex align="center">
              <Text fontSize="sm" fontWeight="bold">
                Creator:
              </Text>
              <Text fontSize="sm" ml={2}>
                {currentServer.creator || 'Unknown'}
              </Text>
            </Flex>
            <Flex align="center">
              <Text fontSize="sm" fontWeight="bold">
                Date of creation:
              </Text>
              <Text fontSize="sm" ml={2}>
                {currentServer.createdAt
                  ? new Date(currentServer.createdAt).toLocaleDateString()
                  : 'N/A'}
              </Text>
            </Flex>
            <Flex align="center">
              <Text fontSize="sm" fontWeight="bold">
                Status:
              </Text>
              <Badge ml={2} colorScheme="green">
                Active
              </Badge>
            </Flex>
            <Flex align="center">
              <Text fontSize="sm" fontWeight="bold">
                Tags:
              </Text>
              {(currentServer.tags || []).map((tag, index) => (
                <Badge key={index} ml={2} colorScheme="pink">
                  {tag}
                </Badge>
              ))}
              {(!currentServer.tags || currentServer.tags.length === 0) && (
                <Text fontSize="sm" ml={2}>
                  None
                </Text>
              )}
            </Flex>
          </VStack>
        </Box>

        {/* Members */}
        <Box w="100%">
          <Text fontSize="sm" fontWeight="bold">
            Members
          </Text>
          <VStack align="start" spaceY={2} mt={2}>
            {members.map((member) => (
              <Flex key={member.id} align="center">
                <Avatar.Root>
                  <Avatar.Fallback name={member.username} />
                  <Avatar.Image />
                </Avatar.Root>
                <Text ml={2}>{member.username}</Text>
                <Badge ml="auto" colorScheme="pink">
                  {member.role || 'Member'}
                </Badge>
              </Flex>
            ))}
            {members.length === 0 && (
              <Text fontSize="sm" color="gray.500">
                No members available
              </Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
