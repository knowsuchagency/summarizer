import storage from "~storage"

type SummaryType = "summary" | "takeaway"
type Engine = "agnes" | "daphne" | "muriel"

const MAX_CACHE_SIZE = 500 // Max number of items in the cache
const cache = new Map<string, string>() // LRU cache

// Load the cache from storage
async function loadCache() {
  const storedCache = await storage.get("cache")
  if (storedCache) {
    const entries = Object.entries(storedCache)
    for (const [key, value] of entries) {
      cache.set(key, value)
    }
  }
}

// Save the cache to storage
async function saveCache() {
  const cacheObj: { [key: string]: string } = {}
  for (const [key, value] of cache) {
    cacheObj[key] = value
  }
  await storage.set("cache", cacheObj)
}

// Initialize the cache
loadCache()

async function summarize(
  url: string,
  summaryType: SummaryType = "summary",
  engine: Engine = "agnes"
): Promise<string> {
  const kagiToken = await storage.get("kagiToken")

  console.log(
    `fetching summary for ${url} with engine ${engine} and summary type ${summaryType}`
  )

  console.log(`the kagi token is ${kagiToken}`)

  const key = `${url}-${engine}-${summaryType}`
  const cachedData = cache.get(key)

  if (cachedData) {
    console.log(`using cached summary for ${key}`)
    return cachedData
  }

  const storedData = await storage.get(key)

  if (storedData) {
    console.log(`using cached summary for ${key} from storage`)
    // Add to the in-memory cache
    cache.set(key, storedData)
    // Remove the oldest item if the cache size exceeds the max size
    if (cache.size > MAX_CACHE_SIZE) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
      await storage.remove(oldestKey)
    }
    return storedData
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
  // Add to the in-memory cache
  cache.set(key, output)
  // Store in local storage
  await storage.set(key, output)
  saveCache()
  // Remove the oldest item if the cache size exceeds the max size
  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
    await storage.remove(oldestKey)
  }

  return output
}

export default summarize
