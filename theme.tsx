import type { EmotionCache } from "@mantine/core"
import { MantineProvider } from "@mantine/core"
import type { PropsWithChildren } from "react"

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache
}

function systemDark() {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

export function ThemeProvider({ emotionCache, children }: Props) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={emotionCache}
      theme={{
        colorScheme: systemDark() ? "dark" : "light"
      }}>
      {children}
    </MantineProvider>
  )
}
