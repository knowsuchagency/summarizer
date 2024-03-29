import { Container, List, NavLink, Skeleton, Tabs, Text } from "@mantine/core"
import { useColorScheme } from "@mantine/hooks"
import {
  IconAdjustments,
  IconBulb,
  IconDog,
  IconNews
} from "@tabler/icons-react"
import React, { useEffect, useState } from "react"

import Options from "~options"
import summarize from "~summarize"
import { ThemeProvider } from "~theme"

function Loading() {
  return (
    <>
      <Skeleton height={8} radius="xl" />
      <Skeleton height={8} mt={6} radius="xl" />
      <Skeleton height={8} mt={6} width="70%" radius="xl" />
    </>
  )
}

function BulletList({ bullets }: { bullets: string }) {
  const lines = bullets.split("\n").filter(Boolean)
  const bulletArray = lines.map((line) => (
    <List.Item key={line.replace(/^-\s*/, "")}>
      {line.replace(/^-\s*/, "")}
    </List.Item>
  ))

  return (
    <List>
      <Text fz="md" fw={500}>
        {bulletArray}
      </Text>
    </List>
  )
}

function TextWrapper({ text }: { text: string }) {
  const ableToSummarize = !text.includes(
    "We are sorry, we were not able to summarize this"
  )

  if (!ableToSummarize) {
    return (
      <Text fz="lg" fw={500}>
        Unable to summarize, text is too short.
      </Text>
    )
  }

  if (text.startsWith("- ")) {
    return <BulletList bullets={text} />
  }

  return (
    <Text fz="lg" fw={500}>
      {text}
    </Text>
  )
}

function LoadingOrText({
  loading,
  text,
  keyMoments
}: {
  loading: boolean
  text: string
  keyMoments: boolean
}) {
  const defaultPadding = "1.4rem"
  return (
    <Container p={defaultPadding} pr={keyMoments ? "3rem" : defaultPadding}>
      {loading ? <Loading /> : <TextWrapper text={text} />}
    </Container>
  )
}

function assertIsNonEmptyString(value: unknown): asserts value is string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("The summary returned is empty.")
  }
}

function KeyMoments({ url }: { url: string }) {
  const [keyMoments, setKeyMoments] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKeyMoments = async () => {
      setIsLoading(true)
      try {
        const keyMoments = await summarize(url, "takeaway")
        // assert that keyMoments is a non-empty string
        assertIsNonEmptyString(keyMoments)
        setKeyMoments(keyMoments)
      } catch (error) {
        setKeyMoments(error.message)
      }
      setIsLoading(false)
    }

    fetchKeyMoments()
  }, [url])

  return (
    <LoadingOrText loading={isLoading} text={keyMoments} keyMoments={true} />
  )
}

function Summary({ url }: { url: string }) {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!url) return

    const fetchSummary = async () => {
      setIsLoading(true)
      try {
        const summary = await summarize(url)
        // assert that summary is a non-empty string
        assertIsNonEmptyString(summary)
        setSummary(summary)
      } catch (error) {
        setSummary(error.message)
      }
      setIsLoading(false)
    }

    fetchSummary()
  }, [url])

  return <LoadingOrText loading={isLoading} text={summary} keyMoments={false} />
}

function IndexPopup() {
  const [url, setUrl] = useState("")
  const colorScheme = useColorScheme()

  useEffect(() => {
    // @ts-ignore
    const queryTabs = window.chrome?.tabs?.query || browser.tabs.query

    queryTabs({ active: true, currentWindow: true }, function (tabs) {
      setUrl(tabs[0].url)
    })
  }, [])

  return (
    <ThemeProvider>
      <Tabs
        defaultValue="Summary"
        orientation="horizontal"
        variant="outline"
        keepMounted={false}
        sx={{ width: "550px" }}>
        <Tabs.List
          grow={true}
          sx={{
            position: "sticky",
            top: 0,
            width: "100%",
            zIndex: 1,
            background: colorScheme === "dark" ? "#1e1e1e" : "#fff"
          }}>
          {url && (
            <>
              <Tabs.Tab value="Summary" icon={<IconNews size={16} />}>
                Summary
              </Tabs.Tab>
              <Tabs.Tab value="Key Moments" icon={<IconBulb size={16} />}>
                Key Moments
              </Tabs.Tab>
            </>
          )}

          <Tabs.Tab value="Settings" icon={<IconAdjustments size={16} />}>
            Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Settings" pt="xs">
          <Options />
        </Tabs.Panel>

        {url && (
          <>
            <Tabs.Panel value="Summary" pt="xs">
              <Summary url={url} />
            </Tabs.Panel>
            <Tabs.Panel value="Key Moments" pt="xs">
              <KeyMoments url={url} />
            </Tabs.Panel>

            <NavLink
              component="a"
              href={`https://kagi.com/summarizer/index.html?url=${url}`}
              label="Open summary in new tab"
              target="_blank"
              icon={<IconDog size={16} stroke={1.5} />}
              variant="subtle"
              active
            />
          </>
        )}
      </Tabs>
    </ThemeProvider>
  )
}

export default IndexPopup
