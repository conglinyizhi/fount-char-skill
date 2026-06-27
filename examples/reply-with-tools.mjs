// =============================================================================
// examples/reply-with-tools.mjs — 带工具的回复生成器（完整示例）
// =============================================================================
// 基于 GentianAphrodite 的 reply_gener/index.mjs 简化而来。
// 集成了逻辑引擎 + 骰子 + 搜索 + 定时器工具。
//
// 替换 templates/minimal/reply_gener/index.mjs 即可获得一个
// 带完整工具链的角色卡。
// =============================================================================

import { buildPromptStruct } from '../../../../../src/public/parts/shells/chat/src/prompt_struct.mjs'
import { loadAnyPreferredDefaultPart } from '../../../../../src/server/parts_loader.mjs'

// ---- 引入工具 ----
import { buildLogicalResults } from './logic-engine.mjs'
import { diceRoller } from './dice.mjs'
import { webSearchHandler } from './web-search.mjs'
import { timerHandler } from './timer.mjs'
import { extractMemories, MemoryPrompt } from './memory.mjs'

// ---- 引入 prompt 构建 ----
import { buildPrompt } from '../prompt/build.mjs'

/**
 * 获取一个用于添加长时间日志的函数
 * （简化版，仅记录不检测循环）
 * @param {object} result - 回复结果容器
 * @param {object} prompt_struct - prompt 结构体
 */
function getLongTimeLogAdder(result, prompt_struct) {
  return function AddLongTimeLog(entry) {
    entry.charVisibility = [prompt_struct.char_id]
    result.logContextBefore?.push?.(entry)
    prompt_struct.char_prompt.additional_chat_log.push(entry)
  }
}

/**
 * 带工具链的回复生成
 * @param {object} args - fount 聊天请求参数
 * @returns {Promise<object>} 回复对象
 */
export async function GetReply(args) {
  // ---- 1. 加载 AI 源 ----
  const AIsource = await loadAnyPreferredDefaultPart(
    args.username, 'serviceSources/AI'
  )
  if (!AIsource) {
    return { content: '未配置 AI 源，请在 fount 设置中配置。' }
  }

  // ---- 2. 构建逻辑上下文 ----
  const logicalResults = await buildLogicalResults(args)

  // ---- 3. 注入插件 ----
  args.plugins = Object.assign({}, args.plugins || {})

  // ---- 4. 构建 prompt 结构体 ----
  const prompt_struct = await buildPromptStruct(args)
  const AddLongTimeLog = getLongTimeLogAdder(
    { logContextBefore: [], content: '' }, prompt_struct
  )

  // ---- 5. 准备回复容器 ----
  const result = {
    content: '',
    logContextBefore: [],
    logContextAfter: [],
    files: [],
    extension: {},
  }

  // ---- 6. 回复预览更新器（可选：用于流式输出的实时处理） ----
  const oriPreviewUpdater = args.generation_options?.replyPreviewUpdater
  args.generation_options = args.generation_options || {}
  args.generation_options.replyPreviewUpdater = (r) => {
    oriPreviewUpdater?.(r)
  }

  // ---- 7. 调用 AI 源 ----
  args.generation_options.base_result = result
  await AIsource.StructCall(prompt_struct, args.generation_options)

  // ---- 8. 后处理：执行工具调用 ----
  // 按顺序处理工具（可以多次循环处理 AI 触发的连锁调用）
  let toolProcessed = true
  let loops = 0
  while (toolProcessed && loops < 3) {
    toolProcessed = false
    loops++

    // 骰子
    if (await diceRoller(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
    // 搜索
    if (await webSearchHandler(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
    // 定时器
    if (await timerHandler(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
  }

  // ---- 9. 提取记忆 ----
  extractMemories(args.chat_log, args.chat_name)

  // ---- 10. 返回 ----
  return {
    content: result.content,
    files: result.files,
  }
}
