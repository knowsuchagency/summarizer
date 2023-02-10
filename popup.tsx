import { Container, NavLink, Skeleton, Tabs, Text } from "@mantine/core"
import { IconDog, IconNotebook, IconSquareAsterisk } from "@tabler/icons-react"
import React, { useEffect, useState } from "react"

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

function TextWrapper(props: { html: string }) {
  function ableToSummarize(html) {
    return !html.includes("Unable to summarize, text is too short.")
  }

  const html = ableToSummarize(props.html)
    ? props.html
    : "Unable to summarize, text is too short."

  return (
    <Text fz="xl" fw={500}>
      <p
        style={{ lineHeight: "32px" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Text>
  )
}

function LoadingOrText(props: { loading: boolean; html: string }) {
  return (
    <Container>
      {props.loading ? <Loading /> : TextWrapper({ html: props.html })}
    </Container>
  )
}

function KeyMoments({ url }) {
  const [keyMoments, setKeyMoments] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  async function getTakeaways(url: string): Promise<string> {
    const takeawaysUrl = "https://labs.kagi.com/v1/takeaways"
    const resp = await fetch(takeawaysUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url })
    })
    const data = await resp.json()
    return data.takeaways
  }

  useEffect(() => {
    const fetchKeyMoments = async () => {
      setIsLoading(true)
      const keyMoments = await getTakeaways(url)
      setKeyMoments(keyMoments)
      setIsLoading(false)
    }
    fetchKeyMoments()
  }, [url])

  return <LoadingOrText loading={isLoading} html={keyMoments} />
}

function Summary({ url }) {
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!url) return
    setIsLoading(true)
    const fetchData = async () => {
      const postRequest = await fetch(
        "https://labs.kagi.com/v1/summarization",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ url: url })
        }
      )

      console.log(`summary POST request: ${JSON.stringify(postRequest)}`)

      let responseJson = await (
        await fetch(`https://labs.kagi.com/v1/summary_status?url=${url}`)
      ).json()
      while (responseJson.status !== "completed") {
        console.log(`waiting 1 second for summary of ${url}`)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const newResponse = await fetch(
          `https://labs.kagi.com/v1/summary_status?url=${url}`
        )
        responseJson = await newResponse.json()
      }
      setSummary(responseJson.summary)
      setIsLoading(false)
    }
    fetchData()
  }, [url])

  return <LoadingOrText loading={isLoading} html={summary} />
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
              href={`https://labs.kagi.com/ai/sum?url=${url}`}
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
