import { describe, expect, it } from "vitest"
import { Interval } from "./consts"
import { genSources } from "./pre-sources"

describe("nga 大时代 metadata", () => {
  it("registers the forum as a realtime finance source", () => {
    expect(genSources()).toMatchObject({
      nga: {
        name: "NGA",
        title: "大时代",
        type: "realtime",
        column: "finance",
        color: "orange",
        home: "https://bbs.nga.cn/thread.php?fid=706",
        interval: Interval,
      },
    })
  })
})
