# fount-char-skill

> [fount](https://github.com/steve02081504/fount) 角色卡创建助手 — 从零到部署，一条[龙](https://github.com/steve02081504/GentianAphrodite)。

一份模板、一套工具范例、一个交互式创建向导。让 AI 帮你写 fount 角色卡，也让 AI 知道怎么写 fount 角色卡。

---

## 快速开始

### 用 AI 交互式创建（推荐）

如果你的 AI 助手支持提问，直接说：

> 「帮我创建一个 fount 角色」

AI 会读取本仓库的 `character-wizard.md` 和 `interaction-style.md`，逐步引导你完成。

### 手动创建

1. 复制 `templates/default/` 到你的 fount 角色目录
2. 按 `// TODO:` 标记逐项填写
3. 运行 `node check-todos.mjs 你的角色目录` 确认无遗漏
4. 在 fount 中安装，开始对话

---

## 目录

```
├── SKILL.md                  AI 技能定义（给模型读的入口）
├── character-wizard.md       7 步交互式创建流程
├── interaction-style.md      对话引导的风格与提问哲学
├── check-todos.mjs           TODO 完成度检查脚本
│
├── templates/default/        角色卡模板（18 个文件）
│   ├── main.mjs              入口
│   ├── prompt/               Prompt 构建（人设/语料/背景/规则）
│   ├── reply_gener/          回复生成
│   └── README.md             新手教程
│
├── examples/                 工具范例（按需选用）
│   ├── dice.mjs              骰子
│   ├── web-search.mjs        网页搜索
│   ├── timer.mjs             定时提醒
│   ├── memory.mjs            短期记忆
│   ├── logic-engine.mjs      上下文状态检测
│   └── reply-with-tools.mjs  集成示例
│
└── reference/architecture.md 架构参考
```

---

## 模板特点

- **TODO 驱动** — 所有需填写的位置都有 `// TODO:` 标记，配合 `check-todos.mjs` 防止遗漏
- **JSDoc 类型注解** — 引用 fount 核心类型声明，IDE 有补全
- **分层 Prompt** — 角色设定层 + 系统规则层，权重可控
- **零 NSFW 残留** — 从 GentianAphrodite 脱敏重构而来

## 工具范例

| 工具 | 触发方式 |
|------|---------|
| 骰子 | `<roll-dice>2d6</roll-dice>` |
| 搜索 | `<web-search>关键词</web-search>` |
| 定时器 | `<set-timer><item><time>30m</time>…</item></set-timer>` |

---

## 许可

Apache-2.0
