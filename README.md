# ActionOS (Personal Execution System)

> **输入你想完成的事情，AI 帮你找到下一步行动。**  
> *Describe what you want. Get the next action.*

---

**ActionOS** 是一款专为降低认知负荷、克服拖延与焦虑而设计的 **个人执行系统 (Personal Execution OS)**。它不仅是一个任务管理工具，更是一个结合了行为科学、认知心理学与大语言模型（LLM）的“注意力防御屏障”。

通过 **Clarity Design System** 与极简的注意力管理工作流，ActionOS 帮助你从认知混乱（Chaos）走向秩序（Order），最终无摩擦地启动行动（Action）。

---

## 🌟 核心设计理念 (Product Philosophy)

在 ActionOS 中，我们遵循 **“清晰度大于生产力，专注大于多功能，行动大于过度规划”** 的原则：

*   **脑力快速卸载 (Cognitive Offloading)**：脑子不是用来存事情的，而是用来思考的。随时倒出模糊的思绪，AI 会自动将其重组并分配到对应领域。
*   **下一步原子行动 (Next Action)**：一个大到无法启动的任务只是一个“愿望”。AI 会将所有目标拆解为 **以动词开头**、**耗时小于 30 分钟**、**可立即执行** 的原子行动。
*   **注意力单一焦点模式 (Focus Mode)**：专为 ADHD 和容易分心的用户设计。开启后，整个屏幕只有当下最核心的一张“下一步卡片”，屏蔽一切噪音。
*   **生活事件锚定习惯 (Event-Anchored Habits)**：不同于容易失效的固定钟点闹钟，习惯通过生活事件（如“起床后”、“晚餐后”）作为锚点，随你一天的节奏自适应重生。

---

## ✨ 核心功能特性 (Features)

*   **⚡ 智能认知捕获 (GTD AI Decompose)**：集成强大的 **Vercel AI SDK**，一键对你的大脑凌乱输入进行语义抽取、分类整理与行动拆解。
*   **🎯 单一焦点模式 (Immersive Focus)**：提供全屏沉浸式行动卡片，当所有待办清空时，进入温馨舒适的休息奖励状态，避免焦虑反弹。
*   **🧠 GROW 框架执行教练 (GROW Coaching)**：拒绝ChatGPT式的无尽闲聊，基于诊断卡片提供可能性和选项，找出阻碍你行动的“注意残留”与“项目死角”。
*   **📈 行动动量评估 (Momentum Tracker)**：自动捕获你的行为潜伏期（从创建任务到点击“开始”的时间），计算连续行动天数，形成正向行为反馈环。
*   **📂 经典 PARA 侧边空间**：清晰划分 **运行项目 (Projects)**、**长期目标 (Goals)**、**日常习惯 (Habits)** 与 **沉淀资产 (Assets)**，让记忆重归秩序。
*   **🔌 插件式多模型支持 (Plug & Play LLM)**：原生支持 **Google Gemini**、**Deepseek**、**Anthropic Claude**、**OpenAI**，并提供**完全离线的本地 Mock 模式**，无网无密钥也能极速体验。

---

## 🛠️ 技术栈 (Tech Stack)

*   **前端框架**：Next.js 15 (App Router), TypeScript, TailwindCSS
*   **样式与动效**：Vanilla CSS 动态微交互 + HSL 森林绿调色盘 (`#1F4D3A` 智慧绿，代表成长与冷静)
*   **数据库**：Cloudflare D1 / 本地 JSON 线程安全数据引擎（开箱即用）
*   **AI 适配层**：Vercel AI SDK (`ai`)

---

## 🚀 快速本地自部署 (Self-Deployment)

只需几步，即可在本地独立运行你自己的个人执行系统：

### 1. 克隆仓库
```bash
git clone https://github.com/your-username/action-os.git
cd action-os
```

### 2. 配置环境变量
复制环境模板并配置你的 AI 密钥：
```bash
cp .env.example .env
```
用编辑器打开 `.env`，根据你的首选模型进行配置（如不填写任何 Key，系统将自动进入本地 Mock 离线体验模式）：
```env
# 启用 Deepseek 示例
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_deepseek_api_key

# 或者启用 Google Gemini 示例
# AI_PROVIDER=gemini
# AI_MODEL=gemini-1.5-flash
# GEMINI_API_KEY=your_gemini_api_key
```

### 3. 安装依赖与启动
```bash
npm install
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开启你的高效心流体验！

---

## 📖 数据模型与行为科学

### 任务 (Task) 与 习惯 (Habit) 的本质区别

| 特性 | 原子任务 (Tasks) | 固定习惯 (Routines) |
| :--- | :--- | :--- |
| **生命周期** | 线性流：`待办 ➔ 进行中 ➔ 完成 ➔ 永久消失` | 循环流：`触发 ➔ 执行 ➔ 今日圆满 ➔ 次日自动重置` |
| **触发机制** | 目标分解，手动调度 | **事件锚点 (anchor_time)** 触发，如：*“起床后”*、*“晚餐后”* |
| **心智负荷** | 高，每次启动需要消耗意志力决策 | 低，通过重复形成肌肉记忆与无意识行为 |
| **激励方式** | 完成的清空感，防拖延 | 连续行动天数（Streak 保护机制） |

---

## 🤝 贡献与开源

ActionOS 是一个由 Clarity Design System 驱动的开源探索。我们欢迎任何关于 **行为设计**、**ADHD 体验优化** 和 **大模型提示词重组** 的讨论与 PR！

*   **设计系统规范**：遵循 `#1F4D3A` (Deep Forest Green) 核心色调，杜绝五彩斑斓的 SaaS 霓虹渐变与过度社交化功能，守护用户的绝对专注。
*   **极简主义代码**：我们提倡最直觉、清晰的代码实现，不为单一用途引入过重的抽象与第三方库。

---

## 📄 开源协议
本项目采用 [MIT License](LICENSE) 开源协议。
