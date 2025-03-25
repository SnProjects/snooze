import { useEffect, useState } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import { useAuthStore } from '../stores/auth.store';
import { Tldraw } from 'tldraw';

export function WebSocketTest() {
  return (
    <Box p={4}>
      <Tldraw />
    </Box>
  );
}
