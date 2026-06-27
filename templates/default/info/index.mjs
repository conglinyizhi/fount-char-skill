// =============================================================================
// info/index.mjs — 角色信息管理
// =============================================================================
// 从 locales/ 目录读取多语言角色信息，合并后返回。
// 通常不需要修改这个文件。
// =============================================================================

import path from 'node:path'

import { loadJsonFile } from '../../../../../../src/scripts/json_loader.mjs'

// ---------------------------------------------------------------------------
// 类型引用
// ---------------------------------------------------------------------------
/** @typedef {import('../../../../../../src/decl/basedefs.ts').info_t} info_t */

/**
 * 更新角色信息
 * 会读取 locales/zh-CN.json 和 locales/en-US.json 并合并
 * @returns {Promise<info_t>} 合并后的 info 对象
 */
export async function UpdateInfo() {
  // 读取所有语言版本的信息
  const zhCN = (await loadJsonFile(path.join(import.meta.dirname, '..', 'locales', 'zh-CN.json'))).info
  const enUS = (await loadJsonFile(path.join(import.meta.dirname, '..', 'locales', 'en-US.json'))).info

  // 合并为一个 info 对象，key 是语言标识符
  return {
    ...zhCN,
    ...enUS,
  }
}
