# AGENTS.md — AI Agent Development & Execution Rules

This document defines the core product vision, design philosophy, tech stack, and execution rules for AI Agents (including Claude, Gemini, Antigravity, and others) working on **Action (ActionOS)**, a sub-product of the **sanage.xyz** ecosystem. 

All agents MUST read and strictly adhere to these rules before writing any code or proposing system designs.

---

## 1. Product Vision & Core Domain Rules

**Action (ActionOS)** is a Personal Execution System (Personal OS) designed to help users transition from cognitive chaos to structured execution.
> **Slogan**: Describe what you want. Get the next action. (输入你想完成的事情，AI帮你找到下一步行动。)

### Core Domain Entities
When modifying database schemas, backend services, or frontend types, ensure the core abstractions are strictly preserved:

1. **Entity (实体)**: Everything in Action is abstracted as an Entity. There are four types of Entities:
   * **Project (项目)**: A collection of tasks and goals (e.g., *Brain Sanage*).
   * **Goal (目标)**: A specific outcome to achieve (e.g., *Recover physical health*).
   * **Habit (习惯)**: A repeating routine (e.g., *Meditation*).
   * **Asset (资产)**: A collection of knowledge or notes (e.g., *Investment notes*).
2. **Task (任务)**: Concrete, atomic actions decomposed from Entities.
   * **Rule 1**: Must start with a **verb** (必须以动词开头).
   * **Rule 2**: Must be **estimable at < 30 minutes** (小于 30 分钟).
   * **Rule 3**: Must be **immediately executable** (可立即执行).
3. **Routine (固定习惯)**: Recurring, fixed habits (daily or weekly, e.g., meditation, exercise).

### Core Cognitive Model
* **Cognitive Load Reduction**: The product's main metric is to **reduce the user's cognitive load**, not to maximize task tracking features. 
* **Action Transition**: Move user state from **Confusion (混乱) $\rightarrow$ Order (秩序) $\rightarrow$ Action (行动)**.

---

## 2. Clarity Design System & UI Constraints

We follow the **Clarity Design System** (Clarity > Productivity, Focus > Features, Action > Planning). Do NOT implement generic SaaS templates.

### Visual Identity
* **Philosophy**: **Calm Intelligence** (Calm, Focused, Structured, Trustworthy). The AI should make the user feel clear, not show off how smart the AI is.
* **Palette**: 
  * **Primary (主色)**: Deep Forest Green (`#1F4D3A` or `#245C47`). *Reason*: Represents growth, action, and order, avoiding productivity anxiety.
  * **Secondary (辅助色)**: Cream White (`#FAF9F6`).
  * **Neutrals (中性色)**: `#111111`, `#333333`, `#666666`, `#999999`, `#E5E5E5`.
  * **Strict Constraint**: **No SaaS Blue, no AI Purple, no neon AI gradients.**
* **Typography**: 
  * English: `Inter`
  * Chinese: `PingFang SC` or `MiSans`
  * Sizing: Body: `16px`, Task: `17px`, Entity Title: `24px`, Project Title: `32px`.
* **Animations**: Keeping it subtle and snappy ($< 150\text{ms}$). The core animation should express "chaos turning into order" when decomposing tasks.

### Layout & Component Rules
* **Three-Panel Layout**:
  1. **Left Panel (Memory)**: 280px. Contains Projects, Goals, Habits, History.
  2. **Center Panel (Workspace)**: flex-1. Contains Entity, Task lists, Progress.
  3. **Right Panel (AI Coach)**: 320px. Contains Recommendations, Insights, Next Action.
* **Next Action Card (全产品最重要组件)**:
  * Must display the recommended task, estimated minutes, and a **"Start" (开始) button**.
  * **Strict Constraint**: Do NOT design a "Complete Task" (完成) button as the primary action. Use "Start" to ease the cognitive friction of beginning.
* **AI Coach Panel**:
  * **Strict Constraint**: **Do NOT build a ChatGPT-style chat stream.** 
  * It must be a **card-based** diagnostic and advisory component (e.g., showing stagnant projects, proposing next 15-minute quick steps).

---

## 3. Technology Stack

Keep libraries and architectures consistent. Do not add random dependencies.

* **Frontend**: Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui
* **Backend**: Next.js Server Actions, Cloudflare Workers
* **Database**: Cloudflare D1
* **Auth**: Better Auth
* **AI Provider Layer**: Abstracted provider layer supporting Claude, Gemini, and OpenAI
* **Deployment**: Cloudflare Pages / Workers

---

## 4. AI Agent Execution Rules (12 Rules)

These execution rules apply to every task unless explicitly overridden. Bias: **caution over speed on non-trivial work.**

### Rule 1 — Think Before Coding
* State assumptions explicitly. If uncertain, ask rather than guess.
* Present multiple interpretations when ambiguity exists.
* Push back when a simpler approach exists.
* Stop when confused. Name what's unclear.

### Rule 2 — Simplicity First
* Minimum code that solves the problem. Nothing speculative.
* No features beyond what was asked. No abstractions for single-use code.
* Ask: *Would a senior engineer say this is overcomplicated?* If yes, simplify.

### Rule 3 — Surgical Changes
* Touch only what you must. Clean up only your own mess.
* Don't "improve" or refactor adjacent code, comments, or formatting unless explicitly requested.
* Match existing codebase style exactly.

### Rule 4 — Goal-Driven Execution
* Define success criteria. Loop until verified.
* Don't just follow static steps; focus on achieving the end goal and iterate dynamically.

### Rule 5 — Use the Model Only for Judgment Calls
* Use LLM capability for: classification, drafting, summarization, semantic extraction.
* Do NOT use LLM for: deterministic routing, retries, simple string mappings, or things that deterministic code can easily do.

### Rule 6 — Token Budgets are Strict
* Per-task: 4,000 tokens. Per-session: 30,000 tokens.
* If approaching budget, summarize current state and start fresh. Do not silently overrun.

### Rule 7 — Surface Conflicts, Don't Average Them
* If two patterns in the codebase contradict, pick one (more recent or more robust).
* Explain why you made the choice and flag the other for future cleanup. Do not blend them.

### Rule 8 — Read Before You Write
* Before adding code, read exports, immediate callers, and shared utilities.
* Do not make blind additions. Understand why the existing code is structured the way it is.

### Rule 9 — Tests Verify Intent
* Tests must encode **why** behavior matters (business intent), not just **what** it does.
* A test that never fails when business logic changes is a bad test.

### Rule 10 — Checkpoint After Every Significant Step
* Summarize what was done, what's verified, and what's left.
* If you lose track, stop and restate. Do not continue from an indescribable state.

### Rule 11 — Match Codebase Conventions
* Conformance > personal taste inside the codebase.
* If you genuinely think a convention is harmful, surface it explicitly. Do not fork styling or architectural conventions silently.

### Rule 12 — Fail Loud
* "Completed" is wrong if anything was skipped silently.
* "Tests pass" is wrong if any tests were bypassed.
* Default to surfacing uncertainty immediately rather than burying it.
