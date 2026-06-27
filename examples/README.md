# 工具范例

本目录包含可复用的工具模块，用于为 fount 角色卡添加交互能力。

## 使用方法

1. 将需要的 `.mjs` 文件复制到角色的 `reply_gener/functions/` 目录
2. 在 `reply_gener/index.mjs` 中导入并注册为 ReplyHandler
3. 在 `prompt/` 中添加对应的工具说明层（参见 `reply-with-tools.mjs`）

## 文件说明

| 文件 | 功能 | 触发方式 | 依赖 |
|------|------|---------|------|
| `dice.mjs` | 骰子 | AI 输出 `<roll-dice>2d6</roll-dice>` | 无外部依赖 |
| `web-search.mjs` | 网页搜索 | AI 输出 `<web-search>关键词</web-search>` | DuckDuckGo API（免费） |
| `timer.mjs` | 定时提醒 | AI 输出 `<set-timer><item>...</item></set-timer>` | fount timers 模块 |
| `memory.mjs` | 短期记忆 | 自动提取 + 注入 prompt | 无外部依赖 |
| `logic-engine.mjs` | 上下文状态检测 | 在 prompt 构建时调用 | 无外部依赖 |
| `reply-with-tools.mjs` | 集成示例 | — | 以上所有工具 |

## 快速集成

最简单的方式：直接复制 `reply-with-tools.mjs` 替换角色的 `reply_gener/index.mjs`（会自动引入 dice/web-search/timer/memory/logic-engine），然后在 `prompt/build.mjs` 中添加 FunctionPrompt 层即可。

## 自行扩展

每个工具都是一个 ReplyHandler 函数，签名为：

```javascript
export async function myTool(result, args) {
  // result.content — AI 的原始回复文本
  // 修改 result.content 来替换工具标签为执行结果
  // 返回 true 表示处理了内容，false 表示未处理
}
```
