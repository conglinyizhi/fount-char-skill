// =============================================================================
// examples/web-search.mjs — 网页搜索工具
// =============================================================================
// 让 AI 角色可以搜索网页。AI 输出 <web-search>关键词</web-search> 来触发。
//
// 依赖：需要在 prompt/functions 中注入工具使用说明，
// 并在 reply_gener/index.mjs 中注册为 ReplyHandler。
// =============================================================================

/**
 * 执行网页搜索
 * @param {string} query - 搜索关键词
 * @returns {Promise<{title: string, snippet: string, url: string}[]>}
 */
async function searchWeb(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    const response = await fetch(url)
    const data = await response.json()

    const results = []
    for (const topic of (data.RelatedTopics || []).slice(0, 5)) {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 60),
          snippet: topic.Text.substring(0, 200),
          url: topic.FirstURL,
        })
      }
    }
    return results
  } catch (err) {
    console.error('搜索失败:', err)
    return []
  }
}

/**
 * ReplyHandler: 处理 AI 回复中的搜索指令
 * @type {Function}
 */
export async function webSearchHandler(result, args) {
  let processed = false
  const searchRegex = /<web-search>(?<content>[\s\S]*?)<\/web-search>/gis

  for (const match of result.content.matchAll(searchRegex)) {
    processed = true
    const fullMatch = match[0]
    const query = match.groups.content.trim()
    const searchResults = await searchWeb(query)

    if (searchResults.length > 0) {
      const formatted = searchResults.map((r, i) =>
        `${i + 1}. **${r.title}**\n   ${r.snippet}\n   ${r.url}`
      ).join('\n\n')

      result.content = result.content.replace(
        fullMatch,
        `🔍 搜索 "${query}" 的结果：\n\n${formatted}`
      )
    } else {
      result.content = result.content.replace(
        fullMatch,
        `🔍 搜索 "${query}" 没有找到相关结果。`
      )
    }
  }

  return processed
}
