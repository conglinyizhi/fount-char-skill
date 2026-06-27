// =============================================================================
// prompt/role_settings/background.mjs — 背景故事 / 世界观
// =============================================================================
// 这里定义角色的背景故事、世界观设定等。
//
// 进阶技巧（从 GentianAphrodite 学来的）：
//   你可以使用"按需注入"模式——根据对话上下文
//   只注入与当前话题相关的背景片段，而不是一股脑全塞进去。
//   这样可以节省 prompt 长度，提高 AI 的响应质量。
// =============================================================================

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../../../src/decl/prompt_struct.ts').single_part_prompt_t} single_part_prompt_t */
/** @typedef {import('../../../../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */

/**
 * 背景提示函数
 * @param {chatReplyRequest_t} args - 聊天请求参数
 * @returns {Promise<single_part_prompt_t>}
 */
export async function BackgroundPrompt(args) {
  // ===========================================================================
  // TODO: 编写角色的背景故事。完成后删除所有 TODO 行。
  // ===========================================================================

  const content = `\
// TODO: == 背景故事 ==
// TODO: [你的角色的过去经历、世界观设定等]

// TODO: == 与${args.UserCharname}的关系 ==
// TODO: [角色如何认识${args.UserCharname}的、与${args.UserCharname}的关系发展等]
`

  return {
    text: [
      {
        content,
        important: 0,
      },
    ],
  }
}
