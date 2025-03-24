import { Center, Spinner } from '@chakra-ui/react';
import React from 'react';

export default function LoadingOverlay() {
  return (
    <Center h="100vh">
      <Spinner size="xl" />
    </Center>
  );
}
