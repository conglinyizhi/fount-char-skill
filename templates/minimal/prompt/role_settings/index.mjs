// =============================================================================
// prompt/role_settings/index.mjs — 角色设定层入口
// =============================================================================
// 角色设定是 prompt 中最核心的部分。这里定义了：
//   - 基本人设（名字、外貌、性格）
//   - 语料库（对白范例、语气词）
//   - 背景故事（世界观、经历）
//
// 你可以通过增删下面的 import 来扩展或精简角色设定。
// =============================================================================

import { mergePrompt } from '../build.mjs'
import { BasedefPrompt } from './base_defs.mjs'
import { corpusPrompt } from './corpus.mjs'
import { BackgroundPrompt } from './background.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../../../src/decl/prompt_struct.ts').single_part_prompt_t} single_part_prompt_t */
/** @typedef {import('../../../../../../../../src/public/parts/shells/chat/decl/chatLog.ts').chatReplyRequest_t} chatReplyRequest_t */

/**
 * 角色设定提示函数
 * @param {chatReplyRequest_t} args - 聊天请求参数
 * @returns {Promise<single_part_prompt_t>} - 角色设定的 prompt 对象
 */
export async function RoleSettingsPrompt(args) {
  const result = []

  // 第 1 步：语料库（最早注入，权重最低）
  // 包含对白范例，帮助 AI 学习角色的说话风格
  result.push(corpusPrompt(args))

  // 第 2 步：基本定义
  // 名字、外貌、性格、身份等核心设定
  result.push(BasedefPrompt(args))

  // 第 3 步：背景故事
  // 世界观、角色经历等
  result.push(BackgroundPrompt(args))

  // ========================================
  // 你可以在这里添加更多模块，比如：
  //
  // result.push(AbilityPrompt(args))   // 能力设定
  // result.push(CombatPrompt(args))    // 战斗设定
  // result.push(KnowledgePrompt(args)) // 知识体系
  // result.push(LikesPrompt(args))     // 喜好
  // ========================================

  return mergePrompt(...result)
}
