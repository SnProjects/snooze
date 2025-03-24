'use client';

import { ClientOnly, IconButton, Skeleton } from '@chakra-ui/react';
import { useColorMode } from './color-mode';
import { LuMoon, LuSun } from 'react-icons/lu';

export default function ThemeSwitch() {
  const { toggleColorMode, colorMode } = useColorMode();
  return (
    <ClientOnly fallback={<Skeleton boxSize="8" />}>
      <IconButton onClick={toggleColorMode} variant="outline" aria-label="Toggle theme" w="100%" h="100%">
        {colorMode === 'light' ? <LuSun /> : <LuMoon />}
      </IconButton>
    </ClientOnly>
  );
}
