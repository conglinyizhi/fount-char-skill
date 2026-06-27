// =============================================================================
// prompt/index.mjs — Prompt 入口
// =============================================================================
// 这个文件是 prompt 系统的入口。fount 在每次生成回复前会调用 GetPrompt()。
//
// 整体流程：
//   1. GetPrompt(args) 被 fount 调用
//   2. 调用 buildPrompt(args) 组装所有 prompt 片段
//   3. 返回 { text: [{content, important}, ...] } 给 fount
//
// 每个 text 片段都有 importance 权重（0-99），数值越大越靠前，
// 越不容易在上下文窗口不足时被丢弃。
// =============================================================================

import { buildPrompt } from './build.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../../src/decl/prompt_struct.ts').single_part_prompt_t} single_part_prompt_t */
/** @typedef {import('../../../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */

/**
 * 构建发送给 AI 的完整 prompt
 * @param {chatReplyRequest_t} args - fount 传入的聊天请求参数
 * @returns {Promise<single_part_prompt_t>}
 */
export async function GetPrompt(args) {
  const prompt = await buildPrompt(args)
  return prompt
}

/**
 * 构建"其他角色看到的" prompt（群组对话时）
 * @param {chatReplyRequest_t} args
 * @returns {Promise<single_part_prompt_t>}
 */
export async function GetPromptForOther(args) {
  return {
    text: [
      {
        content: `[这里写你的角色在其他角色眼中的简短描述]`,
        important: 0,
      },
    ],
  }
}
