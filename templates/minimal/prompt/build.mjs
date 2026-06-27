// =============================================================================
// prompt/build.mjs — Prompt 组装器
// =============================================================================
// 这个文件定义了 prompt 的组装逻辑。
// 各部分按顺序拼接，每个部分贡献一段文本。
//
// 拼接顺序（从上到下）：
//   1. 角色设定层 (RoleSettingsPrompt) — 人设、语料、背景
//   2. 系统规则层 (SystemPrompt)       — 行为约束、格式要求
//
// 你可以在这里添加更多层（如记忆层、功能层等）。
// =============================================================================

import { RoleSettingsPrompt } from './role_settings/index.mjs'
import { SystemPrompt } from './system/index.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../../src/decl/prompt_struct.ts').single_part_prompt_t} single_part_prompt_t */
/** @typedef {import('../../../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */

/**
 * 合并多个 prompt 对象
 * @param {...(single_part_prompt_t|Promise<single_part_prompt_t>)} prompts
 * @returns {Promise<single_part_prompt_t>} - 合并后的 prompt
 */
export async function mergePrompt(...prompts) {
  prompts = await Promise.all(prompts.filter(Boolean))
  const result = {
    text: [],
    additional_chat_log: [],
    extension: {},
  }
  for (const prompt of prompts) {
    result.text = result.text.concat(prompt.text || [])
    result.additional_chat_log = result.additional_chat_log.concat(
      prompt.additional_chat_log || []
    )
    result.extension = Object.assign(result.extension, prompt.extension)
  }
  // 过滤空内容
  result.text = result.text.filter((t) => t.content)
  return result
}

/**
 * 构建最终的 Prompt
 * @param {chatReplyRequest_t} args - 聊天请求参数
 * @returns {Promise<single_part_prompt_t>} - 完整的 prompt 对象
 */
export async function buildPrompt(args) {
  return mergePrompt(
    // 第 1 层：角色设定（人设、语料、背景等）
    RoleSettingsPrompt(args),

    // 第 2 层：系统规则（行为约束、格式要求等）
    SystemPrompt(args)

    // 你可以在这里添加更多层，例如：
    // MemoriesPrompt(args),     // 记忆注入
    // FunctionPrompt(args),     // 工具/功能说明
  )
}
