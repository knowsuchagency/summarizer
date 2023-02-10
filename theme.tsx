import { MantineProvider } from "@mantine/core"
import type { EmotionCache } from "@mantine/core"
import type { PropsWithChildren } from "react"
import {createStyles} from "@mantine/core";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache
}

export function ThemeProvider({ emotionCache, children }: Props) {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={emotionCache}
      theme={{
        colorScheme: "dark",
      }}>
      {children}
    </MantineProvider>
  )
}
