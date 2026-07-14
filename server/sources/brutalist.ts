import * as cheerio from "cheerio"
import type { NewsItem } from "@shared/types"

const relativeTimeUnitsMs = {
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
} as const

export default defineSource(async () => {
  const baseURL = "https://brutalist.report"
  const html = await myFetch<string>(`${baseURL}/topic/all`, {
    responseType: "text" as any,
  })
  const $ = cheerio.load(html)
  const now = Date.now()
  const news: NewsItem[] = []
  const seen = new Set<string>()

  $(".brutal-grid > div").each((_, block) => {
    const $block = $(block)
    const sourceName = $block.find("h3 a").first().text().trim()
    $block.find("ul li").each((_, li) => {
      const $li = $(li)
      const $link = $li.find("a").first()
      const href = $link.attr("href")
      const title = $link.text().trim()
      if (!href || !title || seen.has(href)) return
      seen.add(href)

      // 相对时间是 <a> 之外的文本节点，形如 [34m] / [1h]，只在文本节点里找，避免误匹配标题
      const timeText = $li.contents().filter((_, node) => node.type === "text").text()
      const relative = /\[(\d+)([mhd])\]/.exec(timeText)
      const pubDate = relative
        ? now - Number(relative[1]) * relativeTimeUnitsMs[relative[2] as keyof typeof relativeTimeUnitsMs]
        : undefined

      news.push({
        id: href,
        title,
        url: new URL(href, baseURL).toString(),
        pubDate,
        extra: {
          info: sourceName,
        },
      })
    })
  })

  return news.sort((m, n) => ((n.pubDate as number) ?? 0) - ((m.pubDate as number) ?? 0))
})
