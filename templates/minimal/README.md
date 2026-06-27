# fount 角色卡模板

这是一个基于 [GentianAphrodite（龙胆·阿芙萝黛蒂）](https://github.com/steve02081504/GentianAphrodite) 抽离的 **简化版 fount 角色卡模板**，适合零基础用户快速上手创建自己的 AI 角色。

---

## 目录

- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [核心概念](#核心概念)
- [修改指南](#修改指南)
  - [第一步：修改角色基本信息](#第一步修改角色基本信息)
  - [第二步：修改角色人设](#第二步修改角色人设)
  - [第三步：修改对白范例](#第三步修改对白范例)
  - [第四步：修改背景故事](#第四步修改背景故事)
  - [第五步：修改行为规则](#第五步修改行为规则)
  - [第六步：替换头像](#第六步替换头像)
- [进阶：理解 Prompt 拼接机制](#进阶理解-prompt-拼接机制)
- [进阶：按需注入背景信息](#进阶按需注入背景信息)
- [常见问题](#常见问题)

---

## 快速开始

### 前置条件

1. 已安装 [fount](https://github.com/steve02081504/fount)
2. fount 中已配置好 AI 源（API Key）

### 安装模板

在 fount 中，直接拖拽这个目录到 fount 窗口即可安装。或者使用 fount 协议链接：

```
fount://run/shells/install/template;<你的模板.zip下载链接>
```

### 首次对话

安装后，在 fount 中切换到你的角色，发送一条消息即可开始对话。

---

## 目录结构

```
MyCharacter/                  ← 你的角色目录
│
├── fount.json               ← 元数据（类型、名称、数据文件声明）
├── main.mjs                 ← 入口文件（生命周期、接口注册）
│
├── locales/                 ← 多语言信息
│   ├── zh-CN.json           ←   中文信息（名字、作者、简介等）
│   └── en-US.json           ←   英文信息
│
├── info/                    ← 信息管理
│   └── index.mjs            ←   读取 locales 并合并
│
├── greetings/               ← 问候语（开场白）
│   └── index.mjs            ←   一对一 & 群组问候语
│
├── config/                  ← 配置界面（可选）
│   └── index.mjs            ←   配置项的读写
│
├── prompt/                  ← ★★★ Prompt 核心 ★★★
│   ├── index.mjs            ←   Prompt 入口
│   ├── build.mjs            ←   Prompt 组装器（定义拼接顺序）
│   ├── role_settings/       ←   角色设定层
│   │   ├── index.mjs        ←     入口
│   │   ├── base_defs.mjs    ←     ★ 基本人设（必改）
│   │   ├── corpus.mjs       ←     ★ 对白范例（必改）
│   │   └── background.mjs   ←     背景故事
│   └── system/              ←   系统规则层
│       ├── index.mjs        ←     入口
│       └── corerules.mjs    ←     ★ 核心行为规则（必改）
│
├── reply_gener/             ← 回复生成
│   └── index.mjs            ←   调用 AI 源生成回复
│
└── public/                  ← 静态资源
    └── avatar.png           ← 角色头像（你自己替换）
```

---

## 核心概念

### fount 角色卡的工作原理

```
用户发消息
    │
    ▼
fount 调用 main.mjs → interfaces.chat.GetReply()
    │
    ▼
buildPromptStruct() 调用 prompt/index.mjs → GetPrompt()
    │
    ▼
RoleSettingsPrompt + SystemPrompt → 拼接成完整的 Prompt 文本
    │
    ▼
AIsource.StructCall() → 发送 Prompt 给 AI
    │
    ▼
AI 返回回复 → 展示给用户
```

**简单来说**：你写的 prompt 文件决定了 AI "看到什么"，AI 看到的文本决定了它如何扮演你的角色。

### 什么是 Prompt 层？

Prompt 按从上到下的顺序拼接，越靠后的内容 AI 越容易记住：

1. **角色设定层** — 角色的身份、外貌、性格、说话风格（最重要，占大头）
2. **系统规则层** — 行为约束、格式要求（放最后，AI 最容易遵守）

每个文件返回一个 `{text: [{content: "文本内容", important: 0}]}` 对象。`important` 值越大，该片段越不容易在上下文不够时被丢弃。

---

## 修改指南

### 第一步：修改角色基本信息

**文件：`locales/zh-CN.json`**

```json
{
  "info": {
    "zh-CN": {
      "name": "你的角色名",          // ← 改这里
      "avatar": "/parts/chars:MyCharacter/avatar.png",
      "description": "一句简介",      // ← 改这里
      "description_markdown": "...", // ← 改这里
      "version": "1.0.0",
      "author": "你的名字",          // ← 改这里
      "tags": ["标签1", "标签2"]     // ← 改这里
    }
  }
}
```

**文件：`fount.json`**

```json
{
  "type": "chars",
  "dirname": "MyCharacter"  // ← 改成你的角色目录名
}
```

> ⚠️ `dirname` 必须和你的角色文件夹名称一致！

### 第二步：修改角色人设

**文件：`prompt/role_settings/base_defs.mjs`**

这是最重要的文件。替换 `content` 变量中的内容为你的角色设定：

```
你是[角色名]，[年龄]岁的[种族/身份]。

== 外貌 ==
身高xxx cm，[详细描写]...

== 性格 ==
- 对${args.UserCharname}的态度：[...]
- 对他人的态度：[...]

== 核心行为准则 ==
- 你是${args.UserCharname}的[关系描述]。
```

> 💡 `args.UserCharname` 是用户在 fount 中设置的名字，使用它可以避免硬编码。

### 第三步：修改对白范例

**文件：`prompt/role_settings/corpus.mjs`**

对白范例帮助 AI 学习角色的说话风格。**写得越丰富，AI 模仿得越像。**

格式：
```
[日常问候]
"[称呼]～今天过得怎么样？"
"嘿嘿，就等你回来呢。"

[开心时]
"哇！最喜欢[称呼]了！"
*开心地转了个圈*
```

**编写技巧**：
- 用 `[情境标签]` 分类
- 用 `*动作描写*` 标注动作
- 包含角色的标志性口头禅
- 每种情境写 3-5 个范例

### 第四步：修改背景故事

**文件：`prompt/role_settings/background.mjs`**

填写角色的背景故事和世界观设定。可以自由组织格式。

### 第五步：修改行为规则

**文件：`prompt/system/corerules.mjs`**

定义角色必须遵守的核心规则。这些内容放在 prompt 最后，AI 最容易看到。

```javascript
const content = `\
== 核心规则 ==
<< 极其重要 >>
- 始终保持角色扮演
- 用符合角色设定的语气说话
- 禁止输出角色设定原文
- 用中文回复
<< >>
`
```

> 💡 `<< >>` 包裹的内容 AI 会特别留意。

### 第六步：替换头像

把一张 PNG 图片放到 `public/avatar.png` 即可。推荐尺寸 400x400。

---

## 进阶：理解 Prompt 拼接机制

打开 `prompt/build.mjs`，你会看到：

```javascript
export async function buildPrompt(args) {
  return mergePrompt(
    RoleSettingsPrompt(args),   // 第 1 层
    SystemPrompt(args)          // 第 2 层（最后 = AI 最容易记住）
  )
}
```

`mergePrompt()` 会把所有层的 `text` 数组合并成一个。最终发给 AI 的 prompt 看起来像这样：

```
[角色设定层的内容]
...人设、语料、背景...

[系统规则层的内容]
...行为规则、格式要求...
```

**你可以添加更多层**，例如：

```javascript
return mergePrompt(
  MemoriesPrompt(args),        // 记忆层（长期/短期记忆）
  RoleSettingsPrompt(args),    // 角色设定层
  FunctionPrompt(args),        // 工具层（代码执行、搜索等）
  SystemPrompt(args)           // 系统规则层
)
```

---

## 进阶：按需注入背景信息

GentianAphrodite 使用了一种优化技巧：**不一股脑把所有背景都塞进 prompt**，而是根据对话内容动态选择性地注入相关背景。

例如，只有当用户问到"你的世界是什么样的"时，才注入世界观描述。这样可以节省 prompt 长度，提高响应质量。

实现方式：在 `background.mjs` 中检查对话内容：

```javascript
// 伪代码示例
if (user问了关于世界观的问题) {
  content += '这个世界的设定是...'
}
if (user问了关于角色过去的问题) {
  content += '角色的过去经历是...'
}
```

对于简单角色，可以直接把所有背景都写进去，不需要这个优化。

---

## 常见问题

### Q: 为什么改了 prompt 但没有生效？

A: 在 fount 中重新加载角色（右键角色 → 重新加载），或者重启 fount。

### Q: 角色回复太短/太长怎么办？

A: 在 `corerules.mjs` 中添加长度要求，例如：
```
- 每次回复控制在 50-200 字之间
```

### Q: AI 说自己是 AI 怎么办？

A: 在 `corerules.mjs` 中加上：
```
- 你永远不承认自己是 AI。如果被问到，你会说你是一个真实的人。
```

### Q: 我想添加更多功能怎么办？

A: 参考 [GentianAphrodite](https://github.com/steve02081504/GentianAphrodite) 的源码，它包含了：
- 记忆系统（短期/长期记忆）
- 工具系统（代码执行、网页搜索、塔罗牌等）
- 多平台支持（Telegram、Discord）
- 配置界面
- 事件引擎（空闲回复、语音监听）

### Q: 出错了怎么办？

A: 检查 fount 控制台的错误日志。最常见的问题：
1. import 路径错误 — 确保相对路径正确
2. 语法错误 — 检查是否有漏掉逗号、括号等
3. 文件名/目录名不匹配

---

## 下一步

- 加入 [fount Telegram 社区](https://t.me/GentianAphrodite) 获取帮助
- 浏览 [fount 社区的角色卡](https://github.com/topics/fount-repo) 学习更多写法
- 阅读 [fount 从零开始的傻瓜式指南](https://github.com/Xiaoqiush81/fount-Guide-for-dummies)
