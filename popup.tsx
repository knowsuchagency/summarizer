import { Container, List, NavLink, Skeleton, Tabs, Text } from "@mantine/core"
import { IconDog, IconNotebook, IconSquareAsterisk } from "@tabler/icons-react"
import React, { useEffect, useState } from "react"

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
      <Text fz="sm" fw={500}>
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
      <Text fz="sm" fw={500}>
        Unable to summarize, text is too short.
      </Text>
    )
  }

  if (text.startsWith("- ")) {
    return <BulletList bullets={text} />
  }

  return (
    <Text fz="sm" fw={500}>
      {text}
    </Text>
  )
}

function LoadingOrText({ loading, text }: { loading: boolean; text: string }) {
  return (
    <Container>{loading ? <Loading /> : <TextWrapper text={text} />}</Container>
  )
}

function KeyMoments({ url }: { url: string }) {
  const [keyMoments, setKeyMoments] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchKeyMoments = async () => {
      setIsLoading(true)
      const keyMoments = await summarize(url, "takeaway")
      setKeyMoments(keyMoments)
      setIsLoading(false)
    }

    fetchKeyMoments()
  }, [url])

  return <LoadingOrText loading={isLoading} text={keyMoments} />
}

function Summary({ url }: { url: string }) {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!url) return

    const fetchSummary = async () => {
      setIsLoading(true)
      const summary = await summarize(url)
      setSummary(summary)
      setIsLoading(false)
    }

    fetchSummary()
  }, [url])

  return <LoadingOrText loading={isLoading} text={summary} />
}

function IndexPopup() {
  const [url, setUrl] = useState("")

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
        sx={{ width: "400px" }}>
        <Tabs.List grow={true}>
          <Tabs.Tab value="Summary" icon={<IconNotebook size={16} />}>
            Summary
          </Tabs.Tab>
          <Tabs.Tab value="Key Moments" icon={<IconSquareAsterisk size={16} />}>
            Key Moments
          </Tabs.Tab>
        </Tabs.List>

        {url && (
          <>
            <Tabs.Panel value="Summary" pt="md">
              <Summary url={url} />
            </Tabs.Panel>
            <Tabs.Panel value="Key Moments" pt="xs">
              <KeyMoments url={url} />
            </Tabs.Panel>

            <NavLink
              component="a"
              href={`https://kagi.com/summarizer/index.html?url=${url}`}
              label="Kagi"
              target="_blank"
              icon={<IconDog size={16} stroke={1.5} />}
            />
          </>
        )}
      </Tabs>
    </ThemeProvider>
  )
}

export default IndexPopup
