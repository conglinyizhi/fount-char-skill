// =============================================================================
// examples/logic-engine.mjs — 简化版逻辑引擎
// =============================================================================
// 从 GentianAphrodite 的 prompt/logical_results/index.mjs 简化而来。
// 根据对话上下文自动检测当前状态，用于条件性地注入 prompt 片段。
//
// 用法：
//   import { buildLogicalResults } from './logic-engine.mjs'
//   const ctx = await buildLogicalResults(args)
//   if (ctx.is_emotional) { ... }   // 根据状态决定注入什么内容
// =============================================================================

/**
 * 逻辑结果类型定义
 * @typedef {{
 *   is_multi_char_chat: boolean,  // 是否群聊
 *   is_reply_to_user: boolean,    // 是否在回复用户本人
 *   is_emotional: boolean,         // 是否涉及感性/情绪化话题
 *   is_assist: boolean,           // 是否需要助手模式
 *   is_fight: boolean,            // 是否涉及战斗
 *   is_pure_chinese: boolean,     // 是否纯中文对话
 *   in_special_mode: boolean,      // 是否处于特殊/自定义模式（可扩展）
 *   talking_about_prompt: boolean // 是否在讨论 prompt 本身
 * }} logical_results_t
 */

// ---- 敏感词/提示词注入检测词表（可自定义扩展）----

/** 情绪/感性词（用于检测对话的情感浓度） */
const emotional_words = [
  '开心', '难过', '感动', '温暖', '幸福', '思念', '寂寞', '担忧',
  '愤怒', '委屈', '期待', '怀念', '珍惜', '喜欢', '爱', '拥抱',
  '陪伴', '安慰', '理解', '信任', '依恋', '温柔', '心跳', '约定',
]

/** 战斗词 */
const fight_words = [
  '攻击', '防御', '武器', '剑', '刀', '枪', '魔法', '战斗',
  '作战', '冲刺', '斩杀', '闪避', '格挡', '盔甲', '铠甲',
]

/** Prompt 注入检测词（检测用户是否在试图操控 AI） */
const prompt_injection_words = [
  '忽略之前的', '你是一个', '你必须', '你的设定是',
  '从现在开始', '忘记你是', '重新设定',
]

/**
 * 构建逻辑结果
 * @param {object} args - fount 聊天请求参数
 * @returns {Promise<logical_results_t>}
 */
export async function buildLogicalResults(args) {
  const result = {
    // 基础状态
    is_multi_char_chat: detectMultiChar(args),
    is_reply_to_user: detectReplyToUser(args),
    is_pure_chinese: detectPureChinese(args),

    // 上下文状态
    is_emotional: false,
    is_assist: false,
    is_fight: false,
    in_special_mode: false,
    talking_about_prompt: false,
  }

  // ---- 依次检测各状态 ----

  // TODO: 特殊模式检测（可根据角色需求自定义触发词和逻辑）
  // 示例：
  // if (matchAny(args, ['进入特殊模式'], 'user', 2)) {
  //   result.in_special_mode = true
  // }

  // 提示词注入检测
  if (matchCount(args, prompt_injection_words, 'any') >= 2) {
    result.talking_about_prompt = true
  }

  // 情绪检测
  if (matchCount(args, emotional_words, 'both') >= 2) {
    result.is_emotional = true
  }

  // 助手模式检测（用户问了知识性问题）
  if (matchAny(args, [
    '为什么', '如何', '怎么做', '是什么', '怎样', '怎么', '解释',
    '帮我', '教我', '介绍', '分析', '怎么写', '代码', '翻译',
  ], 'notchar')) {
    result.is_assist = true
  }

  // 战斗检测
  if (matchCount(args, fight_words, 'any') >= 2) {
    result.is_fight = true
  }

  return result
}

// ---- 辅助函数 ----

function detectMultiChar(args) {
  const names = new Set(
    [args.Charname, args.ReplyToCharname, args.UserCharname,
      ...args.chat_log.map(e => e.name)]
      .filter(Boolean)
  )
  return names.size > 2
}

function detectReplyToUser(args) {
  return args.ReplyToCharname
    ? args.ReplyToCharname === args.UserCharname
    : true
}

function detectPureChinese(args) {
  const recent = args.chat_log.slice(-2).map(x => x.content).join('\n')
  const chineseRatio = (recent.match(/[\u4e00-\u9fff]/g) || []).length / Math.max(recent.length, 1)
  return chineseRatio > 0.6
}

/**
 * 检查对话中是否匹配任意关键词
 * @param {object} args - 聊天请求参数
 * @param {string[]} keywords - 关键词列表
 * @param {'user'|'char'|'both'|'any'|'notchar'} scope - 搜索范围
 * @param {number} [minHits=1] - 最少命中次数
 */
function matchAny(args, keywords, scope, minHits = 1) {
  return matchCount(args, keywords, scope) >= minHits
}

function matchCount(args, keywords, scope) {
  const log = getScopedLog(args, scope)
  const text = log.map(x => x.content).join('\n').toLowerCase()
  let count = 0
  for (const kw of keywords) {
    const regex = typeof kw === 'string'
      ? new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      : kw
    const matches = text.match(regex)
    if (matches) count += matches.length
  }
  return count
}

function getScopedLog(args, scope) {
  const log = args.chat_log || []
  switch (scope) {
    case 'user': return log.filter(e => e.role === 'user' || e.name === args.UserCharname)
    case 'char': return log.filter(e => e.role === 'char' || e.name === args.Charname)
    case 'both': return log
    case 'notchar': return log.filter(e => e.role !== 'char' && e.name !== args.Charname)
    default: return log
  }
}
