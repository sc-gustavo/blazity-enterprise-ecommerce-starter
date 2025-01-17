import { env } from "env.mjs"
import { MetadataRoute } from "next"
import { algolia } from "clients/search"
import { getDemoCategories, getDemoProducts, isDemoMode } from "utils/demo-utils"
import type { PlatformCollection } from "lib/shopify/types"
import type { CommerceProduct } from "types"

export const revalidate = 604800 // once a week
export const runtime = "nodejs"

const BASE_URL = env.LIVE_URL
const HITS_PER_PAGE = 24

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(new Date().setHours(0, 0, 0, 0)),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/terms-conditions`,
      lastModified: new Date(),
      priority: 0.1,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      priority: 0.1,
    },
  ]

  let allHits: CommerceProduct[] = []
  let allCollections: PlatformCollection[] = []

  if (!isDemoMode()) {
    allHits = await getResults(env.ALGOLIA_PRODUCTS_INDEX)
    allCollections = await getResults(env.ALGOLIA_CATEGORIES_INDEX)
  } else {
    allHits = getDemoProducts().hits
    allCollections = getDemoCategories()
  }

  const paginationRoutes = Array.from({ length: allHits?.length / HITS_PER_PAGE }, (_, i) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${BASE_URL}/search?page=${i + 1}`,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const productRoutes = allHits?.map((hit) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${BASE_URL}/product/${hit.handle}`,
      lastModified: hit.updatedAt,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  const collectionsRoutes = allCollections?.map((collection) => {
    const item: MetadataRoute.Sitemap[0] = {
      url: `${BASE_URL}/category/${collection.handle}`,
      lastModified: collection.updatedAt,
      priority: 0.5,
      changeFrequency: "monthly",
    }
    return item
  })

  return [...staticRoutes, ...paginationRoutes, ...productRoutes, ...collectionsRoutes]
}

async function getResults<T extends Record<string, any>>(indexName: string) {
  const { hits } = await algolia.search<T>({
    indexName,
    searchParams: {
      hitsPerPage: 50,
    },
  })

  return hits || ([] as T[])
}
