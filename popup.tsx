import React, { useEffect, useState } from "react"

const IndexPopup = () => {
    const [url, setUrl] = useState("")
    const [summary, setSummary] = useState("")
    const [isLoading, setIsLoading] = useState(false)

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
            const postRequest = await fetch("https://labs.kagi.com/v1/summarization", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ url: url }),
            })

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
      <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: 16,
            width: 500,
            height: "100%",
            fontSize: 20
          }}>
        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <p
                style={{
                  fontSize: 24,
                  lineHeight: "32px",
                  textAlign: "justify"
                }}
                dangerouslySetInnerHTML={{ __html: summary }}
            />
        )}
      </div>
  )
}

export default IndexPopup
