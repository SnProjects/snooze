import { Box, Button, EmptyState, Flex, List, VStack } from '@chakra-ui/react';
import { HiColorSwatch } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {

  const nav = useNavigate();

  return (
    <Flex h="100vh" alignItems="center" justifyContent="center">
      <EmptyState.Root>
        <EmptyState.Content>
          <EmptyState.Indicator>
            <HiColorSwatch />
          </EmptyState.Indicator>
          <VStack textAlign="center">
            <EmptyState.Title>Nothing to look at here</EmptyState.Title>
            <EmptyState.Description>
              We couldn't find the page you were looking for
            </EmptyState.Description>
          </VStack>
          <List.Root variant="marker">
            <List.Item>Check the URL</List.Item>
            <List.Item>Go back to the previous page</List.Item>
            <List.Item>Or click on the button below</List.Item>

            <Button colorScheme="primary" size="lg" mt={4} onClick={() => nav('/')}>
              Go back home
            </Button>

          </List.Root>
        </EmptyState.Content>
      </EmptyState.Root>
    </Flex>
  );
};

export default NotFound;
