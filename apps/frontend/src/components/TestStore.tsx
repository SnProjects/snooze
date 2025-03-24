import { useServerStore } from '../stores/server.store';
import { Box, Text } from '@chakra-ui/react';

export function TestStore() {
  const { servers } = useServerStore();
  return (
    <Box>
      <Text>Server Count: {servers.length}</Text>
    </Box>
  );
}
