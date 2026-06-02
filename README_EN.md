# ActionOS (Personal Execution System)

> **Describe what you want. Get the next action.**  
> *输入你想完成的事情，AI 帮你找到下一步行动。*

📖 [中文 README](./README.md)

---

**ActionOS** is a **Personal Execution OS** designed to reduce cognitive load, overcome procrastination, and eliminate productivity anxiety. It is not just another task manager, but an "attention defense barrier" combining behavioral science, cognitive psychology, and Large Language Models (LLMs).

Powered by the **Clarity Design System** and an attention-first workflow, ActionOS moves your state from Chaos to Order, and ultimately to frictionless Action.

---

## 🌟 Product Philosophy

In ActionOS, we adhere to the core principles: **"Clarity > Productivity, Focus > Features, Action > Planning"**:

*   **Cognitive Offloading**: Your brain is for having ideas, not holding them. Offload your messy thoughts instantly; the AI will restructure and dispatch them to the correct life domains.
*   **Next Atomic Actions**: A goal too big to start is just a wish. The AI decomposes all inputs into **verb-first**, **immediately executable** atomic actions that take **under 30 minutes**.
*   **Immersive Focus Mode**: Specifically engineered for ADHD and easily distracted minds. When activated, all workspace clutter and recommendations disappear, leaving only a single "Next Action Card" on the screen.
*   **Event-Anchored Habits**: Unlike clock-based alarms that easily break, habits are anchored to life events (e.g., *"After waking up"*, *"After dinner"*), adapting to the natural rhythm of your day.

---

## ✨ Features

*   **⚡ AI Cognitive Capture (GTD AI Decompose)**: Integrates the **Vercel AI SDK** to extract semantics, categorize domains, and split actions from raw brain-dump text inputs in one click.
*   **📥 Capture Inbox & Backlog Tasks**: Supports "Save to Drafts" to offload mental load instantly. Provides an inbox view, sidebar counts badge, and a **Backlog task pool** to isolate deferred tasks from polluting your active day.
*   **🌅 Daily Shutdown Ritual**: A guided four-step workflow triggered automatically after 20:00 (or manually via the clock button) to review wins, defer/delete leftovers, pre-heat tomorrow's focus, and get an inspiring quote to close out the work day.
*   **🎯 Immersive Focus Mode**: Provides a clean focus screen with a **Pomodoro Timer**. When all tasks are cleared, transitions into a comforting, guilt-free rest/coffee screen.
*   **🧠 GROW Coaching Panel**: No endless ChatGPT-style chat streams. Provides card-based positive diagnosis and feedback to solve "attention residues" and "stagnant projects".
*   **⚙️ ADHD Emotional Resistance & Sensory Assist**: Optional toggles for time-blindness timers, **emotional block diagnostics** (diagnosing why you skip a task and proposing gentle GROW paths), and supportive broken streak text protection.
*   **📈 Comparative Momentum Tracker**: Captures task startup latency. Displays **completed count, consecutive streak, and average startup times compared week-over-week** (e.g., `+2 vs last week`, `5m faster than last week`).
*   **📂 PARA-style Workspace**: Organizes your life domains cleanly into **Projects**, **Goals**, **Habits**, and **Assets** to restore mental order.
*   **🔌 Plug & Play LLM Engine**: Native support for **Google Gemini**, **Deepseek**, **Anthropic Claude**, and **OpenAI**, with a **fully offline local Mock Mode** when no API keys are configured.

---

## 🛠️ Tech Stack

*   **Framework**: Next.js 15 (App Router), TypeScript, TailwindCSS
*   **Styles & Transitions**: Vanilla CSS micro-interactions + HSL Calm Green Palette (`#1F4D3A` representing growth, action, and order)
*   **Database**: Cloudflare D1 / Local JSON safe thread database engine (plug-and-play)
*   **AI Provider Layer**: Vercel AI SDK (`ai`)

---

## 🚀 Local Self-Deployment

Run your own Personal Execution System locally in three steps:

### 1. Clone the Repository
```bash
git clone https://github.com/sanage-lab/action.git
cd action
```

### 2. Configure Environment Variables
Copy the template file to set your AI API keys:
```bash
cp .env.example .env
```
Open `.env` and fill in your preferred provider configuration (If left empty, the app defaults to offline Mock Mode):
```env
# Example: Deepseek
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
DEEPSEEK_API_KEY=your_deepseek_api_key

# Example: Google Gemini
# AI_PROVIDER=gemini
# AI_MODEL=gemini-1.5-flash
# GEMINI_API_KEY=your_gemini_api_key
```

### 3. Install & Start
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to start your high-focus execution workflow!

---

## 📖 Data Model & Behavioral Science

### Tasks vs. Habits

| Attribute | Atomic Tasks | Event-Anchored Habits |
| :--- | :--- | :--- |
| **Lifecycle** | Linear: `Pending ➔ Started ➔ Done ➔ Archiving` | Cyclic: `Triggered ➔ Executed ➔ Done Today ➔ Midnight Reset` |
| **Trigger** | Goal breakdown, manual scheduling | **Life Event Anchor (anchor_time)** (e.g. *"After waking up"*) |
| **Cognitive Friction** | High (each startup requires active willpower) | Low (forms automatic muscle memory through repetition) |
| **Reinforcement** | Sense of completion, empty workspace | Streaks (Streak broken protection, non-punishing reminders) |

---

## 🤝 Contributing

ActionOS is an open-source experiment driven by the Clarity Design System. We welcome issues and PRs regarding **behavioral design**, **ADHD accessibility**, and **prompt optimization**.

*   **Design Constraints**: Respect the `#1F4D3A` Deep Forest Green color palette. Avoid busy SaaS gradients and over-engineered social features. Protect the user's attention.
*   **Simplicity First**: Write readable, direct code. Avoid heavy abstractions or unnecessary third-party libraries.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
