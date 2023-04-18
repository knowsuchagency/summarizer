import type { EmotionCache } from "@mantine/core"
import { MantineProvider } from "@mantine/core"
import type { PropsWithChildren } from "react"
import { useColorScheme } from "@mantine/hooks";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache
}

export function ThemeProvider({ emotionCache, children }: Props) {

  const colorscheme = useColorScheme()

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      emotionCache={emotionCache}
      theme={{
        colorScheme: colorscheme,
      }}>
      {children}
    </MantineProvider>
  )
}
