// =============================================================================
// examples/reply-with-tools.mjs — 带工具的回复生成器（完整示例）
// =============================================================================
// 集成了骰子 + 搜索 + 定时器工具。
//
// 替换 templates/default/reply_gener/index.mjs 即可获得一个
// 带完整工具链的角色卡。
// =============================================================================

import { buildPromptStruct } from '../../../../../src/public/parts/shells/chat/src/prompt_struct.mjs'
import { loadAnyPreferredDefaultPart } from '../../../../../src/server/parts_loader.mjs'

// ---- 引入工具 ----
import { diceRoller } from './dice.mjs'
import { webSearchHandler } from './web-search.mjs'
import { timerHandler } from './timer.mjs'
import { extractMemories } from './memory.mjs'

/**
 * 获取一个用于添加长时间日志的函数
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
  const AIsource = await loadAnyPreferredDefaultPart(
    args.username, 'serviceSources/AI'
  )
  if (!AIsource) {
    return { content: '未配置 AI 源，请在 fount 设置中配置。' }
  }

  args.plugins = Object.assign({}, args.plugins || {})

  const prompt_struct = await buildPromptStruct(args)
  const AddLongTimeLog = getLongTimeLogAdder(
    { logContextBefore: [], content: '' }, prompt_struct
  )

  const result = {
    content: '',
    logContextBefore: [],
    logContextAfter: [],
    files: [],
    extension: {},
  }

  const oriPreviewUpdater = args.generation_options?.replyPreviewUpdater
  args.generation_options = args.generation_options || {}
  args.generation_options.replyPreviewUpdater = (r) => {
    oriPreviewUpdater?.(r)
  }

  args.generation_options.base_result = result
  await AIsource.StructCall(prompt_struct, args.generation_options)

  // 后处理：执行工具调用
  let toolProcessed = true
  let loops = 0
  while (toolProcessed && loops < 3) {
    toolProcessed = false
    loops++

    if (await diceRoller(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
    if (await webSearchHandler(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
    if (await timerHandler(result, { ...args, prompt_struct, AddLongTimeLog })) {
      toolProcessed = true
    }
  }

  extractMemories(args.chat_log, args.chat_name)

  return {
    content: result.content,
    files: result.files,
  }
}
