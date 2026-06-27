// =============================================================================
// examples/memory.mjs — 简化版记忆系统
// =============================================================================
// 从 GentianAphrodite 的 prompt/memory/short-term-memory.mjs 简化而来。
// 提供基础的短期记忆功能：提取对话要点，注入到 prompt。
//
// 用法：
//   1. 在角色 Load 时调用 loadMemory()
//   2. 在角色 Unload 时调用 saveMemory()
//   3. 在 prompt 组装时调用 MemoryPrompt(args) 注入记忆
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'

// ---- 配置 ----

/** 最多保留的记忆条目数 */
const MAX_MEMORIES = 50

/** 返回给 prompt 的最相关记忆数 */
const MAX_PROMPT_MEMORIES = 3

/** 记忆文件路径（相对于角色目录） */
const MEMORY_FILE = 'memory/short-term-memory.json'

// ---- 运行时状态 ----

/** @type {{time: number, text: string, keywords: string[]}[]} */
let memories = []

// ---- 公开 API ----

/**
 * 从磁盘加载记忆
 * @param {string} charDir - 角色目录路径
 */
export function loadMemory(charDir) {
  const filePath = path.join(charDir, MEMORY_FILE)
  try {
    if (fs.existsSync(filePath)) {
      memories = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (err) {
    console.error('加载记忆失败:', err)
    memories = []
  }
}

/**
 * 保存记忆到磁盘
 * @param {string} charDir - 角色目录路径
 */
export function saveMemory(charDir) {
  const filePath = path.join(charDir, MEMORY_FILE)
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(memories, null, 2))
}

/**
 * 从最近的对话中提取记忆
 * 在主回复生成完成后调用
 * @param {object[]} chatLog - 最近的聊天记录
 * @param {string} chatName - 聊天名称
 */
export function extractMemories(chatLog, chatName) {
  if (!chatLog || chatLog.length === 0) return

  // 取最近 5 条消息
  const recent = chatLog.slice(-5)
  const combined = recent.map(e => `${e.name}: ${e.content}`).join('\n')

  // 简单关键词提取
  const words = combined
    .replace(/[^\u4e00-\u9fff\w]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && w.length <= 10)
  const wordFreq = {}
  for (const w of words) {
    wordFreq[w] = (wordFreq[w] || 0) + 1
  }
  const keywords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w)

  // 创建记忆条目
  const text = recent
    .map(e => `${e.name === 'char' ? '我' : e.name}：${e.content.substring(0, 100)}`)
    .join(' | ')

  memories.push({
    time: Date.now(),
    text,
    keywords,
  })

  // 只保留最近 MAX_MEMORIES 条
  if (memories.length > MAX_MEMORIES) {
    memories = memories.slice(-MAX_MEMORIES)
  }
}

/**
 * 生成记忆 prompt 片段
 * 根据当前对话内容检索最相关的记忆
 * @param {object} args - fount 聊天请求参数
 * @returns {{text: {content: string, important: number}[]}}
 */
export function MemoryPrompt(args) {
  if (memories.length === 0) return { text: [] }

  // 取最近一条用户消息作为查询
  const lastMsg = args.chat_log
    .filter(e => e.role === 'user' || e.name === args.UserCharname)
    .slice(-1)[0]
  if (!lastMsg) return { text: [] }

  const query = lastMsg.content.toLowerCase()

  // 按关键词匹配度排序
  const scored = memories.map(m => {
    let score = 0
    for (const kw of m.keywords) {
      if (query.includes(kw.toLowerCase())) score += 1
    }
    // 时间加分：越新越相关
    const hoursAgo = (Date.now() - m.time) / 3600000
    score += Math.max(0, (24 - hoursAgo) / 24) * 0.5
    return { ...m, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.slice(0, MAX_PROMPT_MEMORIES).filter(m => m.score > 0)

  if (top.length === 0) return { text: [] }

  const content = `\
== 近期相关记忆 ==
${top.map((m, i) => `${i + 1}. ${m.text}`).join('\n')}
`

  return {
    text: [{
      content,
      important: 5, // 略高于默认，但不抢占核心设定
    }],
  }
}
