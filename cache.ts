import storage from "~storage"

type SummaryType = "summary" | "takeaway"
type Engine = "agnes" | "daphne" | "muriel"

const MAX_CACHE_SIZE = 500 // Max number of items in the cache
const cache = new Map<string, string>() // LRU cache

// Load the cache from storage
async function loadCache() {
  const storedCache = await storage.get("kagiSummarizerCache")
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
  await storage.set("kagiSummarizerCache", cacheObj)
}

// Clear the cache
async function clearCache() {
  cache.clear()
  await storage.remove("kagiSummarizerCache")
}

// Initialize the cache
loadCache()

async function getCachedData(key: string): Promise<string | undefined> {
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

  return undefined
}

async function setCachedData(key: string, value: string): Promise<void> {
  // Add to the in-memory cache
  cache.set(key, value)
  // Store in local storage
  await storage.set(key, value)
  saveCache()
  // Remove the oldest item if the cache size exceeds the max size
  if (cache.size > MAX_CACHE_SIZE) {
    const oldestKey = cache.keys().next().value
    cache.delete(oldestKey)
    await storage.remove(oldestKey)
  }
}

export { clearCache, getCachedData, setCachedData }
