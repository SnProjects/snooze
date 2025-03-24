import { createSystem, defaultConfig, defineConfig, defineTokens } from '@chakra-ui/react'
import { colors } from './colors'
import { fonts } from './fonts'
import { globalCss } from './global-css'
import { radii } from './radii'
import { buttonRecipe } from './recipes/button.recipe'

const config = defineConfig({
  globalCss,
  theme: {
    tokens: defineTokens({ radii, fonts, colors }),
    recipes: {
      button: buttonRecipe
    }
  },
  conditions: {
    active: '&&:is(:active, [data-active]):not(:disabled, [data-disabled], [data-state=open])'
  }
})

export const system = createSystem(defaultConfig, config)
