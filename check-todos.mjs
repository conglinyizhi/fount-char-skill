#!/usr/bin/env node
// =============================================================================
// check-todos.mjs — 检查项目中是否残留未完成的 TODO 标记
// =============================================================================
// 用法：
//   node check-todos.mjs [目录路径]
//
// 默认扫描当前目录下所有 .mjs .json .md 文件。
// 检测 '// TODO' 或 '//TODO' 标记（支持行内任意位置）。
// 找到任何 TODO 则退出码为 1（适合 CI 流程），否则为 0。
//
// 注意：本文件自身不会被扫描。
// =============================================================================

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))

// ---- 配置 ----

const ROOT = process.argv[2] || SCRIPT_DIR
const EXTENSIONS = ['.mjs', '.json', '.md']
const EXCLUDE_DIRS = new Set(['.git', 'node_modules', 'public', '.github'])
const EXCLUDE_FILES = new Set(['check-todos.mjs'])
const TODO_RE = /\/\/\s*TODO\b/

// ---- 扫描逻辑 ----

let total = 0
const found = []

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!EXCLUDE_DIRS.has(e.name)) walk(fp)
    } else if (e.isFile()) {
      if (EXCLUDE_FILES.has(e.name)) continue
      if (EXTENSIONS.includes(path.extname(e.name))) check(fp)
    }
  }
}

function check(fp) {
  const lines = fs.readFileSync(fp, 'utf-8').split('\n')
  const todos = []
  for (let i = 0; i < lines.length; i++) {
    if (TODO_RE.test(lines[i])) {
      todos.push({ line: i + 1, text: lines[i].trim() })
    }
  }
  if (todos.length) {
    found.push({ file: path.relative(ROOT, fp), todos })
    total += todos.length
  }
}

// ---- 执行 ----

console.log(`检查目录: ${ROOT}\n`)

if (!fs.existsSync(ROOT)) {
  console.error(`目录不存在: ${ROOT}`)
  process.exit(1)
}

walk(ROOT)

if (total === 0) {
  console.log('未发现待完成的 TODO 标记。')
  console.log('角色卡已准备就绪，可以部署。')
} else {
  console.log(`发现 ${total} 个 TODO（${found.length} 个文件）：\n`)
  for (const { file, todos } of found) {
    console.log(`  ${file}`)
    for (const { line, text } of todos) console.log(`    L${line}: ${text}`)
    console.log()
  }
  console.log('请完成以上 TODO 后重新运行本脚本。')
  process.exit(1)
}
