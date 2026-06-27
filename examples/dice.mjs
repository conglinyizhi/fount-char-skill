// =============================================================================
// examples/dice.mjs — 骰子工具
// =============================================================================
// 最简单的 fount 工具示例。让 AI 角色可以掷骰子。
//
// 作为 ReplyHandler 插入到 reply_gener/index.mjs 中：
//   import { diceRoller } from './functions/dice.mjs'
//   然后在 regen 循环中调用:
//   await diceRoller(result, { ...args, prompt_struct, AddLongTimeLog })
//
// AI 在回复中输出 <roll-dice>NdM</roll-dice> 标签来掷骰。
// 例如: <roll-dice>2d6</roll-dice> → 掷 2 个 6 面骰
// =============================================================================

/**
 * 解析并执行骰子指令
 * @param {string} diceStr - 如 "2d6+3" 或 "d20"
 * @returns {{rolls: number[], total: number, expr: string}}
 */
function roll(diceStr) {
  const match = diceStr.trim().match(/^(\d+)?d(\d+)([+-]\d+)?$/i)
  if (!match) throw new Error(`无效的骰子表达式: ${diceStr}`)

  const count = parseInt(match[1] || '1', 10)
  const sides = parseInt(match[2], 10)
  const modifier = parseInt(match[3] || '0', 10)

  if (count < 1 || count > 100) throw new Error('骰子数量应在 1-100 之间')
  if (sides < 2 || sides > 1000) throw new Error('骰子面数应在 2-1000 之间')

  const rolls = []
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1)
  }
  const total = rolls.reduce((a, b) => a + b, 0) + modifier

  return { rolls, total, expr: diceStr }
}

/**
 * ReplyHandler: 处理 AI 回复中的骰子指令
 * @type {Function}
 */
export async function diceRoller(result, args) {
  let processed = false

  const diceRegex = /<roll-dice>(?<content>[\s\S]*?)<\/roll-dice>/gis
  for (const match of result.content.matchAll(diceRegex)) {
    processed = true
    const fullMatch = match[0]
    const diceExpr = match.groups.content.trim()

    try {
      const { rolls, total, expr } = roll(diceExpr)
      const rollDetail = rolls.length > 1
        ? `${rolls.join(' + ')} = ${total}`
        : `${total}`

      result.content = result.content.replace(
        fullMatch,
        `🎲 ${expr}: **${rollDetail}**`
      )
    } catch (err) {
      result.content = result.content.replace(
        fullMatch,
        `🎲 ${diceExpr}: (错误: ${err.message})`
      )
    }
  }

  return processed
}
