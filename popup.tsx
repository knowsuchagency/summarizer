import React, { useEffect, useState } from "react"

const IndexPopup = () => {
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

  // useEffect to detect if dark mode is enabled or not
  useEffect(() => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setIsDarkMode(true)
    } else {
      setIsDarkMode(false)
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16,
        width: 500,
        height: "100%",
        fontSize: 20,
        backgroundColor: isDarkMode ? "#333" : "#fff",
        color: isDarkMode ? "#fff" : "#333"
      }}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <p
          style={{
            fontSize: 24,
            lineHeight: "32px",
            textAlign: "justify",
            fontFamily: "system-ui, sans-serif"
          }}
          dangerouslySetInnerHTML={{ __html: summary }}
        />
      )}
    </div>
  )
}

export default IndexPopup
