import { Box } from '@chakra-ui/react';
import React from 'react';
import { Auth } from '../Auth';

const AuthPage: React.FC = () => {
  return (
    <Box h='vh' w={'vw'} display="flex" alignItems="center" justifyContent="center">
      <Auth />
    </Box>
  );
};

export default AuthPage;
