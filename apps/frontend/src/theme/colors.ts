import { defaultConfig, defineTokens } from '@chakra-ui/react'

export const colorPalette = 'gray'

// dark mode colors

export const colors = defineTokens.colors({ primary: defaultConfig.theme!.tokens!.colors![colorPalette] })

