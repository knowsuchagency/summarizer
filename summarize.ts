import storage from "~storage"

import { getCachedData, setCachedData } from "./cache"

type SummaryType = "summary" | "takeaway"

async function summarize(
  url: string,
  summaryType: SummaryType = "summary"
): Promise<string> {
  const kagiToken = await storage.get("kagiToken")
  const engine = (await storage.get("kagiSummarizerEngine")) || "daphne"

  console.log(
    `fetching summary for ${url} with engine ${engine} and summary type ${summaryType}`
  )

  const key = `${url}-${engine}-${summaryType}`
  const cachedData = await getCachedData(key)

  if (cachedData) {
    return cachedData
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bot ${kagiToken}`
  }

  const response = await fetch("https://kagi.com/api/v0/summarize", {
    method: "POST",
    headers,
    body: JSON.stringify({ url, engine, summary_type: summaryType })
  })

  if (!response.ok) {
    throw new Error(`Failed to get summary: ${response.statusText}`)
  }

  const data = await response.json()
  const output = data.data.output

  await setCachedData(key, output)

  return output
}

export default summarize
