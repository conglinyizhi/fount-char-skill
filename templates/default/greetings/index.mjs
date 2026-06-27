// =============================================================================
// greetings/index.mjs — 问候语
// =============================================================================
// 当用户首次与角色对话时，fount 会调用这些函数获取开场白。
// =============================================================================

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */
/** @typedef {import('../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReply_t} chatReply_t */

/**
 * 获取一对一对话的问候语
 * @param {chatReplyRequest_t} args - fount 传入的请求参数
 * @param {number} index - 第几条问候语（角色可以有多个可选开场白）
 * @returns {Promise<chatReply_t>}
 */
export async function GetGreeting(args, index) {
  // 问候语列表 — 你可以在这里添加多个可选开场白
  const greetings = [
    '你好！我是 [角色名]，很高兴认识你～有什么想聊的吗？',
  ]

  // 如果 index 超出范围，fount 会捕获这个错误
  if (index >= greetings.length) throw new Error('Invalid greeting index')

  return {
    content: greetings[index],
  }
}

/**
 * 获取群组对话的问候语
 * @param {chatReplyRequest_t} args - fount 传入的请求参数
 * @param {number} index - 第几条群组问候语
 * @returns {Promise<chatReply_t>}
 */
export async function GetGroupGreeting(args, index) {
  const greetings = [
    '大家好，我是 [角色名]，请多指教。',
  ]

  if (index >= greetings.length) throw new Error('Invalid group greeting index')

  return {
    content: greetings[index],
  }
}
