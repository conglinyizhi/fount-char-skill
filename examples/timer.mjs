// =============================================================================
// examples/timer.mjs — 定时器工具
// =============================================================================
// 让 AI 角色可以设置定时提醒。
// AI 输出 <set-timer> 标签来创建定时器。
//
// 格式：
// <set-timer>
//   <item>
//     <time>30m</time>           <!-- 支持 s/m/h/d -->
//     <trigger>提醒用户喝水</trigger>  <!-- 触发时要说的内容 -->
//     <reason>用户说渴了</reason>      <!-- 为什么设置 -->
//   </item>
// </set-timer>
//
// 依赖 fount 运行时的 getTimers/setTimer (src/server/timers.mjs)
// =============================================================================

/**
 * 解析时间字符串为毫秒
 * @param {string} timeStr - 如 "30m", "2h", "90s", "1d"
 * @returns {number} 毫秒
 */
function parseDuration(timeStr) {
  const match = timeStr.trim().match(/^(\d+)\s*(s|m|h|d)$/i)
  if (!match) throw new Error(`无法解析时间: ${timeStr}`)
  const num = parseInt(match[1])
  switch (match[2].toLowerCase()) {
    case 's': return num * 1000
    case 'm': return num * 60 * 1000
    case 'h': return num * 3600 * 1000
    case 'd': return num * 86400 * 1000
    default: return 0
  }
}

/**
 * ReplyHandler: 处理 AI 回复中的定时器指令
 * @type {Function}
 */
export async function timerHandler(result, args) {
  let processed = false
  const { AddLongTimeLog } = args

  // 从 fount 运行时获取定时器 API
  // 注意：这需要 fount 环境支持
  const setTimerRegex = /<set-timer>(?<content>[\s\S]*?)<\/set-timer>/gis
  let match

  while ((match = setTimerRegex.exec(result.content)) !== null) {
    processed = true
    const fullMatch = match[0]
    const timerContent = match.groups.content

    const itemRegex = /<item>([\s\S]*?)<\/item>/gis
    let itemMatch
    const setResults = []

    while ((itemMatch = itemRegex.exec(timerContent)) !== null) {
      const item = itemMatch[1]
      const timeStr = (item.match(/<time>(.*?)<\/time>/is) || [])[1]?.trim()
      const trigger = (item.match(/<trigger>(.*?)<\/trigger>/is) || [])[1]?.trim()
      const reason = (item.match(/<reason>(.*?)<\/reason>/is) || [])[1]?.trim()

      if (!timeStr || !trigger) {
        setResults.push('❌ 缺少必要字段（time 或 trigger）')
        continue
      }

      try {
        const ms = parseDuration(timeStr)
        // 使用 fount 的定时器系统
        const { setTimer } = await import('../../../../../src/server/timers.mjs')
        setTimer(
          args.username,
          'chars/' + args.char_id,
          `timer_${Date.now()}`,
          ms,
          false, // 不重复
          async () => {
            // 定时器触发时的回调
            const callbackMsg = {
              name: 'system',
              role: 'system',
              content: `⏰ 定时器触发：${trigger}\n设置原因：${reason}`,
            }
            AddLongTimeLog(callbackMsg)
          }
        )
        setResults.push(`✅ 已设置定时器：${timeStr} 后 - ${trigger}`)
      } catch (err) {
        setResults.push(`❌ 设置失败: ${err.message}`)
      }
    }

    result.content = result.content.replace(
      fullMatch,
      `⏰ 定时器设置结果：\n${setResults.join('\n')}`
    )
  }

  return processed
}
