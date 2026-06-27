// =============================================================================
// fount 角色卡入口文件 (main.mjs)
// =============================================================================
// 这是角色卡的核心入口。fount 加载角色时会首先读取这个文件。
// 你需要在这里：
//   1. 声明角色的基本信息（info）
//   2. 实现生命周期钩子（Load / Unload）
//   3. 暴露聊天接口（GetGreeting / GetPrompt / GetReply 等）
//
// 如果你是第一次创建角色，建议按顺序阅读本文件，
// 然后对照 prompt/ 目录下的文件逐步修改。
// =============================================================================

import path from 'node:path'

// ---------------------------------------------------------------------------
// 基础工具 — 这些来自 fount 运行时，不需要修改
// ---------------------------------------------------------------------------
import { loadJsonFile } from '../../../../../src/scripts/json_loader.mjs'
import { addPartLocaleData } from '../../../../../src/scripts/i18n.mjs'

// ---------------------------------------------------------------------------
// 类型引用 — 引用 fount 核心类型声明（src/decl/*.ts），获得 IDE 补全
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../src/decl/charAPI.ts').CharAPI_t} CharAPI_t */
/** @typedef {import('../../../../../src/decl/charAPI.ts').charInit_t} charInit_t */

// ---------------------------------------------------------------------------
// 引入各个功能模块 — 下面这些 import 是你要重点修改的部分
// ---------------------------------------------------------------------------

// 角色信息（从 locales 目录加载多语言信息）
import { UpdateInfo } from './info/index.mjs'

// 问候语
import { GetGreeting, GetGroupGreeting } from './greetings/index.mjs'

// Prompt 构建（核心！）
import { GetPrompt, GetPromptForOther } from './prompt/index.mjs'

// 回复生成
import { GetReply } from './reply_gener/index.mjs'

// 配置界面（可选）
import { GetData, SetData } from './config/index.mjs'

// ---------------------------------------------------------------------------
// 角色基础信息
// ---------------------------------------------------------------------------

/** 当前角色目录的绝对路径 */
export const chardir = import.meta.dirname

/** 当前角色名称（即目录名） */
export const charname = path.basename(chardir)

/** 角色的 URL 路径，用于引用 public/ 下的资源 */
export const charurl = `/parts/chars:${encodeURIComponent(charname)}`

/** 当前用户名（在 Load 时设置） */
export let username = ''

/**
 * 初始化角色基础信息。
 * 在 Load 生命周期的第一步调用。
 * @param {charInit_t} init - fount 传入的初始化数据
 */
export function initCharBase(init) {
  username = init.username
}

// =============================================================================
// 主导出 — fount 角色卡的标准接口
// =============================================================================
// 这个对象必须导出为 default export。
// fount 运行时通过这个接口与你的角色交互。
//
// @type {CharAPI_t}
// =============================================================================

/** @type {CharAPI_t} */
export default {
  // ==================================================
  // info — 角色基本信息
  // 返回 { 'zh-CN': { name, avatar, description, ... }, ... }
  // 在 locales/ 目录中定义多语言版本
  // ==================================================
  info: await UpdateInfo(),

  // ==================================================
  // Load — 角色每次启动时调用
  // 在这里做初始化工作：加载数据、设置定时器、注册事件等
  // 如果抛出异常，fount 会弹出错误提示
  // ==================================================
  Load: async (stat) => {
    // 1. 保存基础信息
    initCharBase(stat)

    // 2. 加载多语言数据到 fount 运行时
    addPartLocaleData(
      username,
      'chars/' + charname,
      ['zh-CN', 'en-US'],
      (locale) => loadJsonFile(chardir + `/locales/${locale}.json`)
    )

    // TODO: 在这里添加你自己的初始化逻辑：
    // TODO:   - 从磁盘加载记忆
    // TODO:   - 初始化定时器
    // TODO:   - 注册事件监听
    //    ...
  },

  // ==================================================
  // Unload — 角色卸载时调用
  // 在这里做清理：保存数据、停止定时器、移除监听等
  // ==================================================
  Unload: async (reason) => {
    // TODO: 在这里添加你的清理逻辑：
    // TODO:   - 保存记忆到磁盘
    // TODO:   - 停止定时器
    // TODO:   - 移除事件监听
    //    ...
  },

  // ==================================================
  // interfaces — 角色对外暴露的接口
  // ==================================================
  interfaces: {
    // -------- 信息接口 --------
    info: { UpdateInfo },

    // -------- 配置接口（可选） --------
    // 如果不需要配置界面，可以删除这一块
    config: { GetData, SetData },

    // -------- 聊天接口（核心！） ---------
    chat: {
      GetGreeting,           // 获取问候语（一对一）
      GetGroupGreeting,      // 获取群组问候语
      GetPrompt,             // 构建发送给 AI 的 prompt
      GetPromptForOther,     // 为其他角色构建的 prompt（群聊时）
      GetReply,              // 生成回复
    },
  },
}
