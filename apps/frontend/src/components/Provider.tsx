'use client';

import { system } from '../theme';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ColorModeProvider, useColorMode } from './ui/color-mode';
import ThemeSwitch from './ui/theme-switch';
import { ThemeProvider } from 'next-themes';
import { InitProvider } from '../context/InitContext';

export function Provider({ children }: { children: React.ReactNode }) {
  const { colorMode } = useColorMode();
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider>
        <InitProvider>{children}</InitProvider>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
