import { beforeEach, describe, expect, it, vi } from "vitest"
import ngaSource from "../server/sources/nga"
import type { RSSHubInfo } from "#/types"

const myFetchMock = vi.hoisted(() => vi.fn())

vi.mock("#/utils/fetch", () => ({
  myFetch: myFetchMock,
}))

const NGA_FORUM_FEED_URL = "https://rsshub.rssforever.com/nga/forum/706?format=json&sorted=true"
const NGA_POST_PUBLISHED_AT = "2026-07-16T06:49:48.000Z"

describe("nga 大时代 source", () => {
  beforeEach(() => {
    myFetchMock.mockReset()
  })

  it("fetches the ordinary forum feed and maps its posts", async () => {
    const rssHubResponse = {
      title: "NGA-大时代",
      home_page_url: "https://nga.178.com/thread.php?fid=706",
      description: "NGA 大时代帖子",
      items: [
        {
          id: "https://nga.178.com/read.php?tid=47192955",
          url: "https://nga.178.com/read.php?tid=47192955",
          title: "示例主题",
          content_html: "示例正文",
          date_published: NGA_POST_PUBLISHED_AT,
        },
      ],
    } satisfies RSSHubInfo
    myFetchMock.mockResolvedValue(rssHubResponse)

    const items = await ngaSource()

    expect(myFetchMock).toHaveBeenCalledOnce()
    const [requestedUrl] = myFetchMock.mock.calls[0]
    expect(requestedUrl.toString()).toBe(NGA_FORUM_FEED_URL)
    expect(items).toEqual([
      {
        id: "https://nga.178.com/read.php?tid=47192955",
        url: "https://nga.178.com/read.php?tid=47192955",
        title: "示例主题",
        pubDate: NGA_POST_PUBLISHED_AT,
      },
    ])
  })
})
