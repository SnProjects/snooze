import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const navigate = useNavigate();

  return (
    <Box p={4} w="full" h="full" display="flex" justifyContent="center" alignItems="center">
      <VStack spaceY={4} align="start">
        <Heading size="lg">Settings</Heading>
        <Text>This is the settings page. (Placeholder)</Text>
        <Button onClick={() => navigate('/')} colorScheme="teal">
          Back to App
        </Button>
      </VStack>
    </Box>
  );
}
