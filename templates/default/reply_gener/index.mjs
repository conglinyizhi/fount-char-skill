// =============================================================================
// reply_gener/index.mjs — 回复生成
// =============================================================================
// 这个文件处理 AI 回复的生成流程。
// 它调用 fount 的 prompt_struct 构建标准 prompt 结构，
// 然后交给 AI 源生成回复，最后处理后返回。
//
// 如果你不需要自定义回复生成逻辑（如调用特定 AI 源、添加函数调用等），
// 可以使用下面的简化版。需要更高级功能（如代码执行、网页搜索等），
// 可以参考 GentianAphrodite 的 reply_gener/index.mjs。
// =============================================================================

import { buildPromptStruct } from '../../../../../src/public/parts/shells/chat/src/prompt_struct.mjs'
import { loadAnyPreferredDefaultPart } from '../../../../../src/server/parts_loader.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../src/decl/AIsource.ts').AIsource_t} AIsource_t */
/** @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */
/** @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReply_t} chatReply_t */

/**
 * 生成 AI 回复
 * @param {chatReplyRequest_t} args - fount 传入的聊天请求参数
 * @returns {Promise<chatReply_t>} - 包含 content 和可选 files 的回复对象
 */
export async function GetReply(args) {
  // ============================================
  // 1. 加载 AI 源
  // ============================================
  // 使用默认的 AI 源（用户在 fount 中配置的）
  const AIsource = await loadAnyPreferredDefaultPart(
    args.username,
    'serviceSources/AI'
  )
  if (!AIsource) {
    return { content: '未配置 AI 源，请在 fount 设置中配置。' }
  }

  // ============================================
  // 2. 构建 prompt 结构体
  // ============================================
  // buildPromptStruct 会调用你在 prompt/ 中定义的 GetPrompt
  const prompt_struct = await buildPromptStruct(args)

  // ============================================
  // 3. 准备回复容器
  // ============================================
  const result = {
    content: '',
    logContextBefore: [],
    logContextAfter: [],
    files: [],
    extension: {},
  }

  // ============================================
  // 4. 调用 AI 源生成回复
  // ============================================
  // StructCall 支持流式输出
  args.generation_options = args.generation_options || {}
  args.generation_options.base_result = result

  await AIsource.StructCall(prompt_struct, args.generation_options)

  // ============================================
  // 5. 返回结果
  // ============================================
  return {
    content: result.content,
    files: result.files,
  }
}
