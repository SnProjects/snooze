import { defineTokens } from '@chakra-ui/react'

export const fontFallback = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`

export const fonts = defineTokens.fonts({
  body: { value: `"DM Sans Variable", ${fontFallback}` },
  heading: { value: `"DM Sans Variable", ${fontFallback}` }
})
