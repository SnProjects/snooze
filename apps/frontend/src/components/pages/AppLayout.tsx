import { Box, Flex } from '@chakra-ui/react';
import React from 'react';
import { ServerSidebar } from '../layout/ServerSidebar';
import { ChannelSidebar } from '../layout/ChannelSidebar';
import { Chat } from '../Chat';
import { RouterWrapper } from '../wrappers/RouterWrapper';
import { RightPanel } from '../layout/RightPanel';
import MiddleArea from '../layout/MiddleArea';

const AppLayout: React.FC = () => {
  return (
    <RouterWrapper>
      <Flex h="100vh">
        <Flex flex={1} backgroundColor={'bg.emphasized'}>
          <Flex marginY={5} marginLeft={5}>
            <ServerSidebar />
          </Flex>
          <Flex flex={1} boxShadow="2xl" zIndex={1} margin={5} borderRadius={8}>
            <ChannelSidebar />
            <MiddleArea />
            <RightPanel />
          </Flex>
        </Flex>
      </Flex>
    </RouterWrapper>
  );
};

export default AppLayout;
