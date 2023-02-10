import { Container, Skeleton, Tabs, Text } from "@mantine/core"
import React, { useEffect, useState } from "react"

import { ThemeProvider } from "~theme"

class Loading extends React.Component {
  render() {
    return (
      <>
        <Skeleton height={8} radius="xl" />
        <Skeleton height={8} mt={6} radius="xl" />
        <Skeleton height={8} mt={6} width="70%" radius="xl" />
      </>
    )
  }
}

function RenderedText(props: { html: string }) {
  return (
    <Text fz="xl" fw={500}>
      <p
        style={{ lineHeight: "32px" }}
        dangerouslySetInnerHTML={{ __html: props.html }}
      />
    </Text>
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

  return (
    <Container>
      {isLoading ? <Loading /> : <RenderedText html={keyMoments} />}
    </Container>
  )
}

function IndexPopup() {
  const [url, setUrl] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // @ts-ignore
    const queryTabs = window.chrome?.tabs?.query || browser.tabs.query
    queryTabs({ active: true, currentWindow: true }, function (tabs) {
      setUrl(tabs[0].url)
    })
  }, [])

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

  return (
    <ThemeProvider>
      <Tabs
        defaultValue="Summary"
        orientation="horizontal"
        sx={{ width: "400px" }}>
        <Tabs.List grow={true}>
          <Tabs.Tab value="Summary">Summary</Tabs.Tab>
          <Tabs.Tab value="Key Moments">Key Moments</Tabs.Tab>
        </Tabs.List>

        {url && (
          <>
            <Tabs.Panel value="Summary" pt="xs">
              <Container>
                {isLoading ? <Loading /> : RenderedText({ html: summary })}
              </Container>
            </Tabs.Panel>
            <Tabs.Panel value="Key Moments" pt="xs">
              <KeyMoments url={url} />
            </Tabs.Panel>{" "}
          </>
        )}
      </Tabs>
    </ThemeProvider>
  )
}

export default IndexPopup
