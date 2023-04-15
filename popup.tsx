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

function TextWrapper(props: { text: string }) {
  function ableToSummarize(text: string) {
    console.log(`text: ${JSON.stringify(text)}`)
    return !text.includes("We are sorry, we were not able to summarize this")
  }

  function BulletList(props: { bullets: string }) {
    const lines = props.bullets.split("\n").filter(Boolean)
    const bulletArray = lines.map((line) => {
      const strippedLine = line.replace(/^-\s*/, "") // remove leading "- " if present
      return <List.Item key={strippedLine}>{strippedLine}</List.Item>
    })
    return (
      <List>
        <Text fz={"sm"} fw={500}>
          {" "}
          {bulletArray}{" "}
        </Text>
      </List>
    )
  }

  let text: any = ableToSummarize(props.text)
    ? props.text
    : "Unable to summarize, text is too short."

  if (text.startsWith("- ")) {
    return BulletList({ bullets: text })
  }

  return (
    <Text fz="sm" fw={500}>
      {text}
    </Text>
  )
}

function LoadingOrText(props: { loading: boolean; text: string }) {
  return (
    <Container>
      {props.loading ? <Loading /> : TextWrapper({ text: props.text })}
    </Container>
  )
}

function KeyMoments({ url }) {
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

function Summary({ url }) {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!url) return
    setIsLoading(true)
    const fetchData = async () => {
      const summary = await summarize(url)
      setSummary(summary)
      setIsLoading(false)
    }
    fetchData()
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
