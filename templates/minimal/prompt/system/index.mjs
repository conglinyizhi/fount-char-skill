// =============================================================================
// prompt/system/index.mjs — 系统规则层入口
// =============================================================================
// 系统规则是 prompt 的最后一部分，通常也是最重要的约束。
// 它告诉 AI "如何行为"：输出格式、语言要求、禁止事项等。
// =============================================================================

import { mergePrompt } from '../build.mjs'
import { CoreRulesPrompt } from './corerules.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../../../src/decl/prompt_struct.ts').single_part_prompt_t} single_part_prompt_t */
/** @typedef {import('../../../../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */

/**
 * 系统提示函数
 * @param {chatReplyRequest_t} args - 聊天请求参数
 * @returns {Promise<single_part_prompt_t>} - 系统规则的 prompt 对象
 */
export async function SystemPrompt(args) {
  const result = []

  // 核心规则
  result.push(CoreRulesPrompt(args))

  // 你可以在这里添加更多系统级模块：
  // result.push(FormatPrompt(args))     // 输出格式要求
  // result.push(LanguagePrompt(args))   // 语言要求

  return mergePrompt(...result)
}
