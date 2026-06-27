# fount 角色卡架构参考

> 基于 GentianAphrodite（第一个 fount 角色卡）的源码分析

## 整体架构

```
main.mjs                         入口：生命周期 + 接口注册
│
├── info/                        角色信息（多语言）
│   └── index.mjs
│
├── greetings/                   开场白
│   └── index.mjs
│
├── config/                      配置界面
│   └── index.mjs
│
├── prompt/                ←── 核心：Prompt 构建
│   ├── index.mjs              入口
│   ├── build.mjs              组装器（mergePrompt）
│   ├── role_settings/         角色设定层
│   │   ├── base_defs.mjs      基本定义
│   │   ├── corpus.mjs         语料库
│   │   ├── background.mjs     背景故事
│   │   ├── modes/             模式（可扩展的自定义模式）
│   │   └── ...
│   ├── system/                系统规则层
│   │   ├── corerules.mjs      核心规则
│   │   ├── user-recognize   用户识别
│   │   └── ...
│   ├── memory/                记忆层
│   │   ├── short-term         短期记忆
│   │   ├── long-term          长期记忆
│   │   └── reality-channel    现实频道历史
│   ├── functions/             工具层
│   │   ├── coderunner.mjs     代码执行
│   │   ├── websearch.mjs      搜索
│   │   ├── dice.mjs           骰子
│   │   ├── timer.mjs          定时器
│   │   └── ...（30+工具）
│   ├── ads/                   广告层
│   └── logical_results/       逻辑引擎
│
├── reply_gener/               回复生成
│   ├── index.mjs              主流程（buildPromptStruct → AI → 后处理）
│   └── functions/             工具实现
│
├── bot_core/                  Bot 核心（多平台）
│   ├── reply.mjs              Telegram/Discord 回复
│   ├── trigger.mjs            触发逻辑
│   └── ...
│
└── interfaces/                平台适配
    ├── telegram/
    ├── discord/
    └── shellassist/
```

## Prompt 拼接顺序

GentianAphrodite 的 prompt 分 5 层（在 `prompt/build.mjs` 中）：

```
1. MemoriesPrompt        记忆（现实频道 → 短期 → 长期）
2. RoleSettingsPrompt    角色设定（语料 → 定义 → 模式 → 能力 → 感性 → 战斗 → 物品 → 喜好 → 身体 → 知识 → 背景）
3. FunctionPrompt        工具说明（约 30 个工具的函数签名和用法）
4. ADPrompt              广告
5. SystemPrompt          系统规则（SOS → Prompt审查 → 状态栏 → 选项 → 贴纸 → 核心规则 → 用户识别 → 特殊回复）
```

## 关键设计模式

### 1. 逻辑引擎前置

`logical_results/index.mjs` 在所有 prompt 构建之前运行，检测对话状态（感性/助手/战斗/自定义模式/群聊…），后续各模块根据这些状态条件性地注入内容。

### 2. 按需注入

不是一股脑塞所有背景，而是用 `match_keys()` 检查用户输入，只注入相关的背景片段。例如用户问到了世界观才注入世界观描述。

### 3. 工具链

ReplyHandler 模式：AI 输出 XML 标签 → `reply_gener` 中 regen 循环捕获 → 执行 → 替换标签为结果。支持连锁触发（一次回复可能触发多个工具）。

### 4. importance 权重

每个 prompt 片段带 `important` 数字，越大越不容易被裁剪。系统规则通常设 50+，角色设定 0-5。
