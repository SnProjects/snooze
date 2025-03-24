import { defineRecipe } from '@chakra-ui/react'

export const buttonRecipe = defineRecipe({
  variants: {
    variant: {
      solid: {
        _active: {
          bg: 'colorPalette.solid/80'
        }
      },

      ghost: {
        _hover: {
          _dark: {
            bg: 'colorPalette.300/10'
          }
        },
        _active: {
          bg: 'colorPalette.300',
          _dark: {
            bg: 'colorPalette.300/20'
          }
        }
      },

      subtle: {
        _active: {
          bg: 'colorPalette.300'
        }
      }
    }
  }
})
