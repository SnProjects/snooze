import { Auth } from '../components/Auth';
import { Chat } from '../components/Chat';
import { ServerSidebar } from '../components/layout/ServerSidebar';
import { ChannelSidebar } from '../components/layout/ChannelSidebar';
import { RightPanel } from '../components/RightPanel';
import { Settings } from '../components/Settings';
import { useAuthStore } from '../stores/auth.store';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router';
import AppRouter from './Router';
import { useInitContext } from '../context/InitContext';
import LoadingOverlay from '../components/wrappers/LoadingOverlay';

export function App() {
  const { loading } = useInitContext();

  if (loading) {
    return (
      <LoadingOverlay />
    );
  }

  return <AppRouter />;

  /* return (
    <Flex h="100vh">
      {user ? (
        <Routes>
          <Route
            path="/"
            element={
              <Flex flex={1} backgroundColor={'bg.emphasized'}>
                <Flex marginY={5} marginLeft={5}>
                  <ServerSidebar />
                </Flex>
                <Flex
                  flex={1}
                  boxShadow="2xl"
                  zIndex={1}
                  margin={5}
                  borderRadius={8}
                >
                  <ChannelSidebar />
                  <Chat />
                  <RightPanel />
                </Flex>
              </Flex>
            }
          />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      ) : (
        <Box
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Auth />
        </Box>
      )}
    </Flex>
  ); */
}
