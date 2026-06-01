"use client";

import React, { useState, useEffect } from "react";
import {
    Compass,
    Target,
    RefreshCw,
    BookOpen,
    Play,
    Sparkles,
    ChevronRight,
    Clock,
    AlertCircle,
    Check,
    TrendingUp,
    Brain,
    Coffee,
    CheckSquare,
    CheckCircle2,
    Sun,
} from "lucide-react";
import { Entity, Task, Routine, HistoryLog } from "@/lib/db";
import { decomposeAction } from "@/app/actions/aiActions";
import { createHabit, toggleHabitCompletion } from "@/app/actions/habitActions";

interface ShellProps {
    initialEntities: Entity[];
    initialTasks: Task[];
    initialRoutines: Routine[];
    initialHistoryLogs: HistoryLog[];
}

export default function Shell({
    initialEntities,
    initialTasks,
    initialRoutines,
    initialHistoryLogs,
}: ShellProps) {
    // UI State - Default selected view is 'today' for Today-centric workflow
    const [entities, setEntities] = useState<Entity[]>(initialEntities);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
    const [historyLogs, setHistoryLogs] =
        useState<HistoryLog[]>(initialHistoryLogs);

    // Reactively synchronize state when Next.js server components refresh and pass down new database props
    useEffect(() => {
        setEntities(initialEntities);
        setTasks(initialTasks);
        setRoutines(initialRoutines);
        setHistoryLogs(initialHistoryLogs);
    }, [initialEntities, initialTasks, initialRoutines, initialHistoryLogs]);

    const [selectedEntityId, setSelectedEntityId] = useState<string>("today");
    const [inputText, setInputText] = useState<string>("");
    const [isDecomposing, setIsDecomposing] = useState<boolean>(false);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [showChaosAnimation, setShowChaosAnimation] =
        useState<boolean>(false);
    const [justCompletedIds, setJustCompletedIds] = useState<string[]>([]);

    // Collapsible panel and Single Focus Mode states
    const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
    const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

    // Onboarding & Habit states
    const [isAddingHabit, setIsAddingHabit] = useState<boolean>(false);
    const [onboardingStep, setOnboardingStep] = useState<number>(0);
    const [newHabitName, setNewHabitName] = useState<string>("");
    const [newHabitGoal, setNewHabitGoal] = useState<string>("");
    const [newHabitFreq, setNewHabitFreq] = useState<
        "daily" | "weekly" | "workday" | "mon_wed_fri" | "custom"
    >("daily");
    const [newHabitAnchor, setNewHabitAnchor] = useState<string>("起床后");
    const [newHabitDuration, setNewHabitDuration] = useState<number>(10);
    const [newHabitMiss, setNewHabitMiss] = useState<number>(0);
    const [newHabitNeedWF, setNewHabitNeedWF] = useState<boolean>(false);
    const [newHabitWFSteps, setNewHabitWFSteps] = useState<
        Array<{ step_num: number; title: string; minutes: number }>
    >([
        { step_num: 1, title: "", minutes: 5 },
        { step_num: 2, title: "", minutes: 10 },
    ]);
    const [newHabitPhrase, setNewHabitPhrase] = useState<string>("");
    const [expandedHabitIds, setExpandedHabitIds] = useState<string[]>([]);
    const [completionAlert, setCompletionAlert] = useState<{
        id: string;
        phrase: string;
    } | null>(null);

    // Active Entity details (dynamically falls back to Today view)
    const defaultEntity = entities.find((e) => e.id === "p1") || entities[0];
    const activeEntity =
        selectedEntityId === "today" || entities.length === 0
            ? {
                  id: "today",
                  type: "project" as const,
                  title: "今日工作区 (Workspace)",
                  description: "整合所有维度的全局行动工作台",
                  today_focus:
                      defaultEntity?.today_focus || "完成今日最值得做的事情",
                  why_focus:
                      defaultEntity?.why_focus || "保持小步快跑的行动惯性",
              }
            : entities.find((e) => e.id === selectedEntityId) || entities[0];

    // Filtered tasks - Today view merges all tasks bilingually, Project view filters specifically
    const filteredTasks =
        selectedEntityId === "today"
            ? tasks
            : tasks.filter((t) => t.entity_id === selectedEntityId);

    // Completed tasks and Recent Wins calculation
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const recentWins = [...completedTasks]
        .sort(
            (a, b) =>
                new Date(b.completed_at || "").getTime() -
                new Date(a.completed_at || "").getTime(),
        )
        .slice(0, 5);

    // Dynamic momentum tracker calculations - completely dynamic (no hardcoded seeds)
    const maxHabitStreak = routines.length > 0 ? Math.max(...routines.map(r => r.streak_days)) : 0;
    
    const startedTasks = tasks.filter(t => t.created_at && t.started_at);
    const avgStartMinutes = startedTasks.length > 0 
        ? Math.round(startedTasks.reduce((acc, t) => {
            const created = new Date(t.created_at).getTime();
            const started = new Date(t.started_at || "").getTime();
            return acc + Math.max(0, started - created);
        }, 0) / startedTasks.length / 60000)
        : 0;

    const momentumStatus = (() => {
        if (completedTasks.length === 0 && maxHabitStreak === 0) {
            return "状态：蓄势待发";
        }
        if (maxHabitStreak >= 7 || completedTasks.length >= 10) {
            return "状态：极强动量持续爆发";
        }
        return "状态：动量稳步激活";
    })();

    // Diagnostic Card 1: Project Action Opportunity (Opportunity)
    const activeProjects = entities.filter(e => e.type === 'project');
    const projectDiagnostic = (() => {
        if (activeProjects.length === 0) {
            return {
                title: "📂 项目行动契机 (Opportunity)",
                badge: "项目初始化",
                badgeColorClass: "bg-[#1F4D3A]/10 text-[#1F4D3A]",
                desc: "目前尚未建立任何项目。大脑适合思考，而不适合储存零散的认知负担。",
                growText: "💡 试试看 (GROW Options)：直接在顶部输入你想完成的事情（例：“本周家庭聚餐规划”、“完善 ActionOS 系统结构”），由 AI 帮你快速解构并创建首个结构化项目，完全释放大脑工作带宽。"
            };
        }
        
        // Find a project with pending tasks, or fallback to the first project
        const projectWithPendingTasks = activeProjects.map(p => {
            const pending = tasks.filter(t => t.entity_id === p.id && t.status !== 'completed');
            return { project: p, pending };
        }).find(item => item.pending.length > 0);

        if (projectWithPendingTasks) {
            const { project, pending } = projectWithPendingTasks;
            const firstTask = pending.sort((a, b) => {
                const pMap = { P1: 1, P2: 2, P3: 3 };
                return (pMap[a.priority] || 3) - (pMap[b.priority] || 3);
            })[0];
            
            return {
                title: "📂 项目行动契机 (Opportunity)",
                badge: "行动唤醒",
                badgeColorClass: "bg-amber-50 text-amber-700",
                desc: `检测到项目【${project.title}】仍有 ${pending.length} 个未完成行动。当感到项目停滞不前时，往往是因为下一步行动过于庞杂。`,
                growText: `💡 试试看 (GROW Options)：只需先开启最核心的原子任务 “${firstTask.title}”，预计只需 ${firstTask.estimated_minutes} 分钟即可突破起跑阻抗，重新拉动项目动量！`
            };
        } else {
            // Project exists but has no pending tasks
            const firstProject = activeProjects[0];
            return {
                title: "📂 项目行动契机 (Opportunity)",
                badge: "燃料填充",
                badgeColorClass: "bg-amber-50 text-amber-700",
                desc: `检测到项目【${firstProject.title}】当前没有待办行动。没有燃料的项目很容易在无意识中停滞。`,
                growText: `💡 试试看 (GROW Options)：尝试为该项目新增一个预计少于 30 分钟的下一步具体行动，例如“梳理最新进展”或“设计测试用例”，重新点燃项目生命力。`
            };
        }
    })();

    // Diagnostic Card 2: Attention Residue (Attention Residue)
    const attentionDiagnostic = (() => {
        if (routines.length === 0) {
            return {
                title: "🧠 注意残留觉察 (Attention Residue)",
                badge: "认知流控",
                badgeColorClass: "bg-[#1F4D3A]/10 text-[#1F4D3A]",
                desc: "频繁在不同待办或想法之间横向切换，会在大脑的工作记忆中留下注意残留，无形累积深度疲劳。",
                growText: "💡 试试看 (GROW Options)：点击“⚡ 日常习惯”旁边的“+ 新建”，录入首个呼吸正念或轻量拉伸习惯，绑定日常事件锚点（如“起床后”、“餐后”），构建认知的韧性防线。"
            };
        }

        const todayStr = new Date().toLocaleDateString('en-CA');
        const pendingRoutine = routines.find(r => {
            const lastCompStr = r.last_completed_at ? new Date(r.last_completed_at).toLocaleDateString('en-CA') : '';
            return lastCompStr !== todayStr;
        });

        if (pendingRoutine) {
            return {
                title: "🧠 注意残留觉察 (Attention Residue)",
                badge: "脑力保护",
                badgeColorClass: "bg-[#1F4D3A]/10 text-[#1F4D3A]",
                desc: "您目前正在多任务间横向切换，工作记忆中的注意残留碎片正在侵蚀你的专注带宽。",
                growText: `💡 试试看 (GROW Options)：现在是唤醒今日习惯 “${pendingRoutine.title}” (${pendingRoutine.anchor_time}) 的极佳行动契机。只需大约 ${pendingRoutine.estimated_minutes} 分钟即可迅速清空大脑缓存，重获单线程专注状态。`
            };
        } else {
            const firstRoutine = routines[0];
            return {
                title: "🧠 注意残留觉察 (Attention Residue)",
                badge: "高效状态",
                badgeColorClass: "bg-[#1F4D3A]/10 text-[#1F4D3A]",
                desc: `今日已圆满完成习惯 “${firstRoutine.title}”。目前大脑前额叶皮层处于健康的单线程低损耗工作状态。`,
                growText: "💡 试试看 (GROW Options)：在交付当前高优先级待办任务后，建议进行 3-5 分钟的短暂闭目静心，深度固化当前认知动量。"
            };
        }
    })();

    // Next Action calculation - Highest priority pending task in current filtered view
    const nextAction = filteredTasks
        .filter((t) => t.status !== "completed")
        .sort((a, b) => {
            const pMap = { P1: 1, P2: 2, P3: 3 };
            return (pMap[a.priority] || 3) - (pMap[b.priority] || 3);
        })[0];

    // Cognitive activation tag mapper
    const getCognitiveTag = (priority: "P1" | "P2" | "P3", minutes: number) => {
        if (minutes <= 10 || priority === "P1") {
            return {
                label: "⚡ 极易启动",
                style: "bg-green-50 text-green-700 border-green-200 animate-pulse",
            };
        } else if (minutes <= 20 || priority === "P2") {
            return {
                label: "⚡ 中等启动",
                style: "bg-amber-50 text-amber-700 border-amber-200",
            };
        } else {
            return {
                label: "⚡ 深度专注",
                style: "bg-red-50 text-red-700 border-red-200",
            };
        }
    };

    // Handle task status updates (cognitive behavior triggers)
    const handleStartTask = (taskId: string) => {
        setActiveTaskId(taskId);
        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        status: "started",
                        started_at: new Date().toISOString(),
                    };
                }
                return t;
            }),
        );
    };

    const handleCompleteTask = (taskId: string) => {
        if (activeTaskId === taskId) {
            setActiveTaskId(null);
        }

        // Add to animation active list for snappy physical feedback (<150ms start)
        setJustCompletedIds((prev) => [...prev, taskId]);
        setTimeout(() => {
            setJustCompletedIds((prev) => prev.filter((id) => id !== taskId));
        }, 450);

        setTasks((prev) =>
            prev.map((t) => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        status: "completed",
                        completed_at: new Date().toISOString(),
                    };
                }
                return t;
            }),
        );
    };

    const handleToggleHabit = async (
        habitId: string,
        completionPhrase?: string,
    ) => {
        setJustCompletedIds((prev) => [...prev, habitId]);
        setTimeout(() => {
            setJustCompletedIds((prev) => prev.filter((id) => id !== habitId));
        }, 450);

        try {
            const result = await toggleHabitCompletion(habitId);
            if (result.success && result.habit) {
                setRoutines((prev) =>
                    prev.map((r) =>
                        r.id === habitId ? (result.habit as Routine) : r,
                    ),
                );

                const todayStr = new Date().toLocaleDateString("en-CA");
                const lastCompStr = result.habit.last_completed_at
                    ? new Date(
                          result.habit.last_completed_at,
                      ).toLocaleDateString("en-CA")
                    : "";
                const isCompleted = lastCompStr === todayStr;

                if (isCompleted && completionPhrase) {
                    setCompletionAlert({
                        id: habitId,
                        phrase: completionPhrase,
                    });
                    setTimeout(() => {
                        setCompletionAlert(null);
                    }, 4000);
                }
            } else {
                alert(`切换习惯状态失败：${result.error}`);
            }
        } catch (err) {
            console.error("Error toggling habit:", err);
        }
    };

    const handleSaveHabit = async () => {
        if (!newHabitName.trim()) return;

        const filteredSteps = newHabitNeedWF
            ? newHabitWFSteps
                  .filter((s) => s.title.trim() !== "")
                  .map((s, idx) => ({ ...s, step_num: idx + 1 }))
            : [];

        const habitData = {
            title: newHabitName.trim(),
            frequency: newHabitFreq,
            anchor_time: newHabitAnchor,
            estimated_minutes: newHabitDuration,
            allowed_miss_days: newHabitMiss,
            completion_phrase: newHabitPhrase.trim() || undefined,
            workflow_steps:
                filteredSteps.length > 0
                    ? JSON.stringify(filteredSteps)
                    : undefined,
        };

        try {
            const result = await createHabit(habitData);
            if (result.success && result.habit) {
                setRoutines((prev) => [...prev, result.habit as Routine]);
                setIsAddingHabit(false);
            } else {
                alert(`创建习惯失败：${result.error}`);
            }
        } catch (err) {
            console.error("Error saving habit:", err);
        }
    };

    const toggleHabitSteps = (habitId: string) => {
        setExpandedHabitIds((prev) =>
            prev.includes(habitId)
                ? prev.filter((id) => id !== habitId)
                : [...prev, habitId],
        );
    };

    // AI Task Decomposition flow with "Chaos -> Order" animation utilizing swappable Server Action
    const handleDecompose = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        setIsDecomposing(true);
        setShowChaosAnimation(true);

        try {
            // 1. Invoke secure server-side model decomposition
            const result = await decomposeAction(inputText.trim());

            if (!result.success) {
                console.error(
                    "[ActionOS UI] AI Decompose failed:",
                    result.error,
                );
                alert(
                    `智能行动拆解失败，请检查 API Key 配置。错误详情: ${result.error}`,
                );
            } else {
                console.log(
                    `[ActionOS UI] AI Decompose completed successfully via: ${result.providerName}`,
                );
                setSelectedEntityId("today"); // Navigate back to primary Focus Today view
            }
        } catch (error) {
            console.error("[ActionOS UI] Error calling server action:", error);
            alert("网络连接故障，请检查服务器连接状态。");
        } finally {
            setInputText("");
            setShowChaosAnimation(false);
            setIsDecomposing(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden h-screen bg-[#FAF9F6]">
            {/* ========================================================================= */}
            {/* 1. LEFT PANEL (Memory) - Width: 280px                                     */}
            {/* ========================================================================= */}
            <aside className="w-[280px] border-r border-[#E5E5E5] bg-[#FAF9F6] flex flex-col justify-between overflow-y-auto shrink-0 select-none border-dashed border-r-[#E5E5E5]">
                <div>
                    {/* Brand Header */}
                    <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-lg bg-[#1F4D3A] flex items-center justify-center text-[#FAF9F6]">
                                <Brain className="w-4 h-4" />
                            </div>
                            <span className="font-semibold text-lg tracking-tight text-[#111111]">
                                ActionOS
                            </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#999999] px-2 py-0.5 bg-[#E5E5E5] rounded">
                            Memory
                        </span>
                    </div>

                    {/* Navigation/Entities lists */}
                    <div className="p-4 space-y-5">
                        {/* Global Views Section */}
                        <div className="space-y-1">
                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60 flex items-center space-x-1">
                                <span className="w-1 h-1 rounded-full bg-[#1F4D3A]"></span>
                                <span>工作台 (Workspace)</span>
                            </div>
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        onClick={() =>
                                            setSelectedEntityId("today")
                                        }
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                            selectedEntityId === "today"
                                                ? "bg-[#1F4D3A] text-[#FAF9F6] font-semibold shadow-sm"
                                                : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111] font-medium"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <Sun className="w-4.5 h-4.5 shrink-0" />
                                            <span>今日工作区 (Workspace)</span>
                                        </div>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                                selectedEntityId === "today"
                                                    ? "bg-[#245C47] text-[#FAF9F6]"
                                                    : "bg-[#E5E5E5]/60 text-[#666666]"
                                            }`}
                                        >
                                            {
                                                tasks.filter(
                                                    (t) =>
                                                        t.status !==
                                                        "completed",
                                                ).length
                                            }
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="border-t border-[#E5E5E5]/60 border-dashed my-3 mx-2"></div>

                        {/* Projects Section */}
                        <div className="space-y-1">
                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60 flex items-center justify-between">
                                <span className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3A]"></span>
                                    <span>📂 运行项目 (Projects)</span>
                                </span>
                                <span className="text-[8px] text-[#999999] font-mono select-none">
                                    LTM
                                </span>
                            </div>
                            <ul className="space-y-1">
                                {entities
                                    .filter((e) => e.type === "project")
                                    .map((ent) => (
                                        <li key={ent.id}>
                                            <button
                                                onClick={() =>
                                                    setSelectedEntityId(ent.id)
                                                }
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                                                    selectedEntityId === ent.id
                                                        ? "bg-[#1F4D3A] text-[#FAF9F6] font-medium shadow-sm"
                                                        : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111]"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 truncate">
                                                    <Compass
                                                        className={`w-4 h-4 shrink-0 ${selectedEntityId === ent.id ? "text-[#FAF9F6]" : "text-[#666666]"}`}
                                                    />
                                                    <span className="truncate">
                                                        {ent.title}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                                        selectedEntityId ===
                                                        ent.id
                                                            ? "bg-[#245C47] text-[#FAF9F6]"
                                                            : "bg-[#E5E5E5]/60 text-[#666666]"
                                                    }`}
                                                >
                                                    {
                                                        tasks.filter(
                                                            (t) =>
                                                                t.entity_id ===
                                                                    ent.id &&
                                                                t.status !==
                                                                    "completed",
                                                        ).length
                                                    }
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <div className="border-t border-[#E5E5E5]/60 border-dashed my-3 mx-2"></div>

                        {/* Goals Section */}
                        <div className="space-y-1">
                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3A]"></span>
                                <span>🎯 长期目标 (Goals)</span>
                            </div>
                            <ul className="space-y-1">
                                {entities
                                    .filter((e) => e.type === "goal")
                                    .map((ent) => (
                                        <li key={ent.id}>
                                            <button
                                                onClick={() =>
                                                    setSelectedEntityId(ent.id)
                                                }
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                                                    selectedEntityId === ent.id
                                                        ? "bg-[#1F4D3A] text-[#FAF9F6] font-medium shadow-sm"
                                                        : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111]"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 truncate">
                                                    <Target
                                                        className={`w-4 h-4 shrink-0 ${selectedEntityId === ent.id ? "text-[#FAF9F6]" : "text-[#666666]"}`}
                                                    />
                                                    <span className="truncate">
                                                        {ent.title}
                                                    </span>
                                                </div>
                                                <span
                                                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                                        selectedEntityId ===
                                                        ent.id
                                                            ? "bg-[#245C47] text-[#FAF9F6]"
                                                            : "bg-[#E5E5E5]/60 text-[#666666]"
                                                    }`}
                                                >
                                                    {
                                                        tasks.filter(
                                                            (t) =>
                                                                t.entity_id ===
                                                                    ent.id &&
                                                                t.status !==
                                                                    "completed",
                                                        ).length
                                                    }
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <div className="border-t border-[#E5E5E5]/60 border-dashed my-3 mx-2"></div>

                        {/* Habits Section */}
                        <div className="space-y-1">
                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60 flex items-center justify-between">
                                <span className="flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3A]"></span>
                                    <span>⚡ 日常习惯 (Habits)</span>
                                </span>
                                <button
                                    onClick={() => {
                                        setIsAddingHabit(true);
                                        setOnboardingStep(0);
                                        setNewHabitName("");
                                        setNewHabitPhrase("");
                                    }}
                                    className="text-[9px] text-[#1F4D3A] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                >
                                    + 新增
                                </button>
                            </div>
                            <ul className="space-y-1">
                                {entities
                                    .filter((e) => e.type === "habit")
                                    .map((ent) => (
                                        <li key={ent.id}>
                                            <button
                                                onClick={() =>
                                                    setSelectedEntityId(ent.id)
                                                }
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                                                    selectedEntityId === ent.id
                                                        ? "bg-[#1F4D3A] text-[#FAF9F6] font-medium shadow-sm"
                                                        : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111]"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 truncate">
                                                    <RefreshCw
                                                        className={`w-4 h-4 shrink-0 ${selectedEntityId === ent.id ? "text-[#FAF9F6]" : "text-[#666666]"}`}
                                                    />
                                                    <span className="truncate">
                                                        {ent.title}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <div className="border-t border-[#E5E5E5]/60 border-dashed my-3 mx-2"></div>

                        {/* Knowledge Assets Section */}
                        <div className="space-y-1">
                            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1F4D3A]/60 flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3A]"></span>
                                <span>📖 沉淀资产 (Assets)</span>
                            </div>
                            <ul className="space-y-1">
                                {entities
                                    .filter((e) => e.type === "asset")
                                    .map((ent) => (
                                        <li key={ent.id}>
                                            <button
                                                onClick={() =>
                                                    setSelectedEntityId(ent.id)
                                                }
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                                                    selectedEntityId === ent.id
                                                        ? "bg-[#1F4D3A] text-[#FAF9F6] font-medium shadow-sm"
                                                        : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111]"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-2 truncate">
                                                    <BookOpen
                                                        className={`w-4 h-4 shrink-0 ${selectedEntityId === ent.id ? "text-[#FAF9F6]" : "text-[#666666]"}`}
                                                    />
                                                    <span className="truncate">
                                                        {ent.title}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Recent Wins completed logs at bottom (Replaces input history) */}
                <div className="p-4 border-t border-[#E5E5E5] bg-[#FAF9F6]/50">
                    <div className="flex items-center space-x-2 px-2 mb-2 text-xs font-semibold text-[#1F4D3A]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>达成记录 (Recent Wins)</span>
                    </div>
                    <div className="max-h-[160px] overflow-y-auto space-y-2 px-2 scrollbar-thin text-xs">
                        {recentWins.length === 0 ? (
                            <p className="text-[10px] text-[#999999] px-2 py-1 select-none font-medium leading-relaxed">
                                今天的首个成果将在这里绽放 ✨ 开始你的下一步，点亮今日动量 🚀
                            </p>
                        ) : (
                            recentWins.map((win) => (
                                <div
                                    key={win.id}
                                    className="text-[#666666] leading-relaxed border-b border-[#E5E5E5]/40 pb-1.5 last:border-0 flex items-start space-x-1.5"
                                >
                                    <Check className="w-3 h-3 text-[#1F4D3A] shrink-0 mt-0.5" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-[#111111] line-through">
                                            {win.title}
                                        </p>
                                        <p className="text-[9px] text-[#999999] mt-0.5 font-mono select-none">
                                            {win.completed_at
                                                ? new Date(
                                                      win.completed_at,
                                                  ).toLocaleTimeString()
                                                : "刚刚"}{" "}
                                            达成
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </aside>

            {/* ========================================================================= */}
            {/* 2. CENTER PANEL (Workspace) - Width: flex-1                               */}
            {/* ========================================================================= */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] relative">
                {/* Workspace Header */}
                <header className="h-[73px] border-b border-[#E5E5E5] px-8 flex items-center justify-between bg-[#FAF9F6] shrink-0">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-[#666666]">
                            <span className="capitalize">
                                {activeEntity.type}
                            </span>
                            <ChevronRight className="w-3 h-3 text-[#999999]" />
                            <span>Workspace</span>
                        </div>
                        <div className="flex items-center space-x-3 mt-0.5">
                            <h1 className="text-xl font-bold text-[#111111] tracking-tight">
                                {activeEntity.title}
                            </h1>
                            
                            {/* Focus Mode Switcher */}
                            <div className="flex items-center space-x-1 bg-[#E5E5E5]/40 p-0.5 rounded-lg border border-[#E5E5E5] text-[10px] font-bold tracking-wider select-none shrink-0">
                                <button
                                    onClick={() => setIsFocusMode(false)}
                                    className={`px-2 py-1 rounded transition-all duration-150 flex items-center space-x-1 cursor-pointer border-none bg-transparent ${
                                        !isFocusMode
                                            ? "bg-[#FFFFFF] text-[#111111] shadow-xs font-bold"
                                            : "text-[#666666] hover:text-[#111111]"
                                    }`}
                                >
                                    <span>📋 清单</span>
                                </button>
                                <button
                                    onClick={() => setIsFocusMode(true)}
                                    className={`px-2 py-1 rounded transition-all duration-150 flex items-center space-x-1 cursor-pointer border-none bg-transparent ${
                                        isFocusMode
                                            ? "bg-[#1F4D3A] text-[#FAF9F6] shadow-xs font-bold"
                                            : "text-[#666666] hover:text-[#1F4D3A]"
                                    }`}
                                >
                                    <Sparkles className="w-3 h-3 shrink-0" />
                                    <span>⚡ 专注</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* Progress bar */}
                        <div className="flex items-center space-x-3 bg-[#E5E5E5]/40 px-3 py-1.5 rounded-lg border border-[#E5E5E5]">
                            <div className="text-right">
                                <div className="text-[10px] text-[#999999] uppercase font-bold tracking-wider">
                                    执行率 (Progress)
                                </div>
                                <div className="text-xs font-semibold text-[#111111] font-mono">
                                    {filteredTasks.length > 0
                                        ? `${Math.round((filteredTasks.filter((t) => t.status === "completed").length / filteredTasks.length) * 100)}%`
                                        : "0%"}
                                </div>
                            </div>
                            <div className="w-16 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#1F4D3A] rounded-full transition-all duration-300"
                                    style={{
                                        width: `${
                                            filteredTasks.length > 0
                                                ? (filteredTasks.filter(
                                                      (t) =>
                                                          t.status === "completed",
                                                  ).length /
                                                      filteredTasks.length) *
                                                  100
                                                : 0
                                        }%`,
                                    }}
                                />
                            </div>
                        </div>

                        {/* Collapsible Coach Toggle Button */}
                        <button
                            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                            className={`px-3 py-1.5 rounded-lg border transition-all duration-150 flex items-center space-x-1.5 text-xs font-semibold select-none cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                                isRightPanelOpen
                                    ? "bg-[#1F4D3A]/10 text-[#1F4D3A] border-[#1F4D3A]/20"
                                    : "bg-[#FAF9F6] text-[#666666] border-[#E5E5E5] hover:bg-[#E5E5E5]/40"
                            }`}
                            title={isRightPanelOpen ? "收起执行教练" : "展开执行教练"}
                        >
                            <Brain className="w-4 h-4 shrink-0" />
                            <span>{isRightPanelOpen ? "收起教练" : "展开教练"}</span>
                        </button>
                    </div>
                </header>

                {/* Central Workspace Area */}
                <section className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
                    {isFocusMode ? (
                        /* Focus Mode Immersive Render */
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] animate-fade-in p-4 w-full">
                            {nextAction ? (
                                <div className="bg-[#FAF9F6] border-2 border-[#1F4D3A] rounded-2xl p-10 shadow-xl relative overflow-hidden space-y-6 w-full max-w-2xl border-solid bg-gradient-to-br from-[#FAF9F6] to-[#1F4D3A]/2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl">
                                    <div className="absolute top-0 right-0 p-6">
                                        <span className="text-[10px] font-black tracking-widest text-[#FAF9F6] bg-[#1F4D3A] px-3.5 py-1.5 rounded-lg uppercase animate-pulse select-none font-mono">
                                            NEXT ACTION · 核心一步
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2 text-xs text-[#1F4D3A] font-bold bg-[#1F4D3A]/10 px-3 py-1 rounded w-fit select-none">
                                            <Clock className="w-4 h-4 shrink-0 text-[#1F4D3A]" />
                                            <span>
                                                建议时长：{nextAction.estimated_minutes} 分钟
                                            </span>
                                        </div>

                                        <h2 className="text-2xl font-black text-[#111111] leading-snug tracking-tight">
                                            {nextAction.title}
                                        </h2>

                                        {nextAction.done_criteria && (
                                            <div className="flex items-start space-x-2.5 text-xs text-[#245C47] bg-[#1F4D3A]/5 border-l-4 border-[#1F4D3A] p-4 rounded-r leading-relaxed">
                                                <span className="font-bold shrink-0">🎯 完成标准:</span>
                                                <span>{nextAction.done_criteria}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-xs text-[#555555] bg-[#E5E5E5]/40 rounded-xl p-4 border border-[#E5E5E5]/60 leading-relaxed font-semibold">
                                        💡 只做这一件，专注当下一小步。
                                    </div>

                                    <div className="flex items-center space-x-4 pt-2">
                                        {nextAction.status !== "started" ? (
                                            <button
                                                onClick={() => handleStartTask(nextAction.id)}
                                                className="px-8 py-4 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-bold rounded-xl text-xs transition-all duration-150 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer border-none"
                                            >
                                                <Play className="w-4 h-4 fill-current shrink-0" />
                                                <span>立即启动行动 (Start Action)</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleCompleteTask(nextAction.id)}
                                                className="px-8 py-4 bg-[#245C47] hover:bg-[#1F4D3A] text-[#FAF9F6] font-bold rounded-xl text-xs transition-all duration-150 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer animate-pulse border-none"
                                            >
                                                <Check className="w-4 h-4 shrink-0" />
                                                <span>标记今日圆满交付 (Mark Complete)</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#FAF9F6] border border-dashed border-[#E5E5E5] rounded-2xl p-12 text-center text-[#999999] space-y-4 shadow-sm w-full max-w-md animate-fade-in">
                                    <Coffee className="w-10 h-10 mx-auto text-[#1F4D3A] animate-bounce" />
                                    <div>
                                        <p className="text-base font-extrabold text-[#111111]">
                                            今日工作区全部清空 🎉
                                        </p>
                                        <p className="text-xs text-[#999999] mt-1.5 leading-relaxed">
                                            所有原子待办已全部被你搞定！脑力重归极致纯净，建议去短暂休息或切换至“清单模式”补充灵感燃料！
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setIsFocusMode(false)}
                                        className="px-4 py-2 border border-[#E5E5E5] bg-white hover:bg-[#E5E5E5]/40 text-[#555555] font-semibold text-xs rounded-lg transition-all cursor-pointer"
                                    >
                                        返回工作台清单 📋
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Standard Mode */
                        <>
                            
                    {/* 2.1 PERMANENT GLOBAL CAPTURE INPUT CARD - Answering GTD Capture & Cognitive Offloading */}
                    <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 pointer-events-none">
                            <Sparkles className="w-5 h-5 text-[#1F4D3A]/20" />
                        </div>

                        <h3 className="text-sm font-semibold text-[#111111] mb-2 flex items-center space-x-1.5">
                            <Sparkles className="w-4 h-4 text-[#1F4D3A]" />
                            <span>
                                你现在脑子里在想什么？(What's on your mind?)
                            </span>
                        </h3>
                        <p className="text-xs text-[#666666] mb-4">
                            这里是您的全局收集箱 (Global Capture
                            Inbox)。无需纠结分类与归纳，把您脑子里的模糊思绪直接倒出来，系统将自动重组并将其精准分发到对应项目中。
                        </p>

                        <form onSubmit={handleDecompose} className="space-y-4">
                            <textarea
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="例如：今天我要优化一下 Brain Sanage 的 SEO 排名，还要配置 Sitemap.xml，晚上还要抽空和朋友一起去外面吃顿饭..."
                                rows={3}
                                className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg p-3 text-[15px] text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#1F4D3A] focus:border-[#1F4D3A] leading-relaxed transition-all resize-none animate-fade-in"
                            />
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-[#999999] flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#1F4D3A]"></span>
                                    <span>
                                        基于 Cognitive Offloading 自动分类归档
                                    </span>
                                </div>
                                <button
                                    type="submit"
                                    disabled={
                                        isDecomposing || !inputText.trim()
                                    }
                                    className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 shadow-sm ${
                                        isDecomposing || !inputText.trim()
                                            ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed"
                                            : "bg-[#1F4D3A] text-[#FAF9F6] hover:bg-[#245C47] active:scale-[0.98]"
                                    }`}
                                >
                                    {isDecomposing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#FAF9F6]/40 border-t-[#FAF9F6] rounded-full animate-spin"></div>
                                            <span>秩序重组中...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            <span>卸载并分配任务</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Custom Chaos -> Order Visual Animation */}
                        {showChaosAnimation && (
                            <div className="absolute inset-0 bg-[#FAF9F6]/90 backdrop-blur-[1px] flex flex-col items-center justify-center transition-all duration-300">
                                <div className="relative w-48 h-12 flex items-center justify-center">
                                    {/* Chaos state words floating around */}
                                    <div className="absolute animate-pulse text-[10px] text-[#999999] font-mono left-2 top-0 select-none">
                                        seo optimization
                                    </div>
                                    <div className="absolute animate-bounce text-[10px] text-[#999999] font-mono right-2 bottom-0 select-none">
                                        buy chicken
                                    </div>
                                    <div className="absolute animate-pulse text-[10px] text-[#999999] font-mono left-1/3 bottom-1 select-none">
                                        sitemap
                                    </div>

                                    {/* Transition line */}
                                    <div className="w-full h-0.5 bg-[#E5E5E5] overflow-hidden relative rounded">
                                        <div className="h-full bg-[#1F4D3A] w-1/3 rounded animate-[ping_1.5s_infinite] absolute left-1/3"></div>
                                    </div>
                                </div>
                                <span className="text-xs font-medium text-[#1F4D3A] mt-2 font-mono tracking-widest animate-pulse">
                                    REDUCING COGNITIVE LOAD...
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2.1.5 Daily Habits Panel (Routines View) - Event-Anchored habits top section */}
                    {selectedEntityId === "today" && (
                        <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                                <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2">
                                    <RefreshCw className="w-4 h-4 text-[#1F4D3A]" />
                                    <span>日常习惯锚点 (Daily Habits)</span>
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsAddingHabit(true);
                                        setOnboardingStep(0);
                                        setNewHabitName("");
                                        setNewHabitPhrase("");
                                    }}
                                    className="text-xs text-[#1F4D3A] hover:text-[#245C47] font-semibold cursor-pointer flex items-center space-x-1 bg-transparent border-none p-0"
                                >
                                    <span>+ 培养新习惯</span>
                                </button>
                            </div>

                            {routines.length === 0 ? (
                                <div className="text-center py-6 text-[#999999] text-xs italic">
                                    暂无绑定习惯。点击右上角“+
                                    培养新习惯”，用生活事件锚定你的每日良性循环。
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Group by anchor_time */}
                                    {Array.from(
                                        new Set(
                                            routines.map(
                                                (r) => r.anchor_time || "其它",
                                            ),
                                        ),
                                    ).map((anchor) => {
                                        const anchorRoutines = routines.filter(
                                            (r) =>
                                                (r.anchor_time || "其它") ===
                                                anchor,
                                        );
                                        return (
                                            <div
                                                key={anchor}
                                                className="space-y-2"
                                            >
                                                <div className="text-[10px] font-bold text-[#1F4D3A] bg-[#1F4D3A]/10 px-2 py-0.5 rounded w-fit select-none">
                                                    {anchor} 锚点
                                                </div>
                                                <div className="divide-y divide-[#E5E5E5]/40 border border-[#E5E5E5]/60 rounded-xl bg-[#FAF9F6]">
                                                    {anchorRoutines.map(
                                                        (routine) => {
                                                            const todayStr =
                                                                new Date().toLocaleDateString(
                                                                    "en-CA",
                                                                );
                                                            const lastCompStr =
                                                                routine.last_completed_at
                                                                    ? new Date(
                                                                          routine.last_completed_at,
                                                                      ).toLocaleDateString(
                                                                          "en-CA",
                                                                      )
                                                                    : "";
                                                            const isCompleted =
                                                                lastCompStr ===
                                                                todayStr;
                                                            const isJustCompleted =
                                                                justCompletedIds.includes(
                                                                    routine.id,
                                                                );
                                                            const isHot =
                                                                (routine.streak_days ||
                                                                    0) >= 10;
                                                            const steps: Array<{
                                                                step_num: number;
                                                                title: string;
                                                                minutes: number;
                                                            }> =
                                                                routine.workflow_steps
                                                                    ? JSON.parse(
                                                                          routine.workflow_steps,
                                                                      )
                                                                    : [];

                                                            return (
                                                                <div
                                                                    key={
                                                                        routine.id
                                                                    }
                                                                    className="p-4 flex items-start justify-between space-x-4"
                                                                >
                                                                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                                                                        {/* Circle Checkbox */}
                                                                        <button
                                                                            onClick={() =>
                                                                                handleToggleHabit(
                                                                                    routine.id,
                                                                                    routine.completion_phrase,
                                                                                )
                                                                            }
                                                                            className={`w-5.5 h-5.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors mt-0.5 cursor-pointer ${
                                                                                isCompleted ||
                                                                                isJustCompleted
                                                                                    ? "bg-[#1D9E75] border-[#1D9E75] text-[#FAF9F6]"
                                                                                    : "border-[#999999] hover:border-[#1F4D3A] text-transparent"
                                                                            }`}
                                                                        >
                                                                            {(isCompleted ||
                                                                                isJustCompleted) && (
                                                                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                                                            )}
                                                                        </button>

                                                                        <div className="min-w-0 flex-1">
                                                                            <p
                                                                                className={`text-[14px] font-bold ${
                                                                                    isCompleted
                                                                                        ? "line-through text-[#999999]"
                                                                                        : "text-[#111111]"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    routine.title
                                                                                }
                                                                            </p>
                                                                            <p className="text-[11px] text-[#999999] mt-0.5 select-none">
                                                                                {
                                                                                    routine.anchor_time
                                                                                }{" "}
                                                                                ·{" "}
                                                                                {
                                                                                    routine.estimated_minutes
                                                                                }{" "}
                                                                                分钟
                                                                                ·{" "}
                                                                                {isCompleted
                                                                                    ? `今天 ${new Date(routine.last_completed_at!).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })} 完成`
                                                                                    : `${routine.streak_days || 0} 天连续中`}
                                                                            </p>

                                                                            {/* Dynamic Workflow Steps */}
                                                                            {steps.length >
                                                                                0 &&
                                                                                expandedHabitIds.includes(
                                                                                    routine.id,
                                                                                ) && (
                                                                                    <div className="mt-3 p-3 bg-[#1F4D3A]/5 border border-[#1F4D3A]/10 rounded-xl space-y-2 select-none animate-fade-in">
                                                                                        {steps.map(
                                                                                            (
                                                                                                step,
                                                                                            ) => (
                                                                                                <div
                                                                                                    key={
                                                                                                        step.step_num
                                                                                                    }
                                                                                                    className="text-xs flex items-center space-x-2 text-[#333333]"
                                                                                                >
                                                                                                    <span className="w-4.5 h-4.5 rounded-full bg-[#E5E5E5] text-[10px] text-[#666666] flex items-center justify-center font-bold">
                                                                                                        {
                                                                                                            step.step_num
                                                                                                        }
                                                                                                    </span>
                                                                                                    <span className="flex-1">
                                                                                                        {
                                                                                                            step.title
                                                                                                        }
                                                                                                    </span>
                                                                                                    <span className="text-[10px] text-[#999999] font-mono font-medium">
                                                                                                        {
                                                                                                            step.minutes
                                                                                                        }{" "}
                                                                                                        min
                                                                                                    </span>
                                                                                                </div>
                                                                                            ),
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex flex-col items-end space-y-2 select-none shrink-0">
                                                                        <span
                                                                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                                                                isHot
                                                                                    ? "bg-amber-100 text-amber-800"
                                                                                    : "bg-green-100 text-green-800"
                                                                            }`}
                                                                        >
                                                                            {routine.streak_days ||
                                                                                0}{" "}
                                                                            天
                                                                        </span>
                                                                        {steps.length >
                                                                            0 && (
                                                                            <button
                                                                                onClick={() =>
                                                                                    toggleHabitSteps(
                                                                                        routine.id,
                                                                                    )
                                                                                }
                                                                                className="text-[10px] text-[#999999] hover:text-[#1F4D3A] font-semibold cursor-pointer bg-transparent border-none p-0"
                                                                            >
                                                                                {expandedHabitIds.includes(
                                                                                    routine.id,
                                                                                )
                                                                                    ? "收起步骤"
                                                                                    : "展开步骤"}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        },
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 2.2 Today Focus Card - Answering "为什么做" */}
                    {activeEntity.today_focus && (
                        <div className="bg-[#FAF9F6] border border-[#1F4D3A]/20 hover:border-[#1F4D3A]/40 rounded-xl p-5 shadow-sm flex items-start space-x-4 transition-all duration-150 bg-gradient-to-r from-[#1F4D3A]/5 to-transparent relative overflow-hidden">
                            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-[#1F4D3A]/5 to-transparent pointer-events-none" />
                            <div className="w-12 h-12 rounded-xl bg-[#1F4D3A] flex items-center justify-center text-[#FAF9F6] shrink-0 shadow-sm">
                                <Brain className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="space-y-1.5 min-w-0 flex-1">
                                <span className="text-[10px] font-bold tracking-widest text-[#1F4D3A] uppercase bg-[#1F4D3A]/10 px-2 py-0.5 rounded">
                                    TODAY FOCUS · 今日焦点
                                </span>
                                <h3 className="text-[17px] font-bold text-[#111111] leading-tight">
                                    {activeEntity.today_focus}
                                </h3>
                                <p className="text-[13px] text-[#666666] leading-relaxed flex items-center space-x-1">
                                    <span className="font-semibold text-[#1F4D3A] shrink-0">
                                        为什么做：
                                    </span>
                                    <span className="truncate">
                                        {activeEntity.why_focus}
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2.3 Next Action Card - Answering "先做什么" */}
                    {nextAction ? (
                        <div className="bg-[#FAF9F6] border-2 border-[#1F4D3A] rounded-xl p-6 shadow-md relative overflow-hidden space-y-4">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="text-[9px] font-bold tracking-widest text-[#FAF9F6] bg-[#1F4D3A] px-2.5 py-1 rounded uppercase animate-pulse">
                                    NEXT ACTION · 核心下一步
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center space-x-2 text-xs text-[#666666] font-medium">
                                    <Clock className="w-3.5 h-3.5 text-[#1F4D3A]" />
                                    <span>
                                        预计启动与专注耗时：
                                        {nextAction.estimated_minutes} 分钟
                                    </span>
                                </div>

                                <h4 className="text-lg font-extrabold text-[#111111] leading-snug tracking-tight">
                                    {nextAction.title}
                                </h4>
                            </div>

                            <div className="text-xs text-[#333333] bg-[#E5E5E5]/30 rounded-lg p-3 border-l-4 border-[#1F4D3A] leading-relaxed">
                                💡 只做这一件，专注当下一小步。
                            </div>

                            <div className="flex items-center space-x-3">
                                {nextAction.status !== "started" ? (
                                    <button
                                        onClick={() =>
                                            handleStartTask(nextAction.id)
                                        }
                                        className="px-6 py-2.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center space-x-2 shadow active:scale-[0.98] cursor-pointer"
                                    >
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                        <span>立即开始 (Start Action)</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() =>
                                            handleCompleteTask(nextAction.id)
                                        }
                                        className="px-6 py-2.5 bg-[#245C47] hover:bg-[#1F4D3A] text-[#FAF9F6] font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center space-x-2 shadow active:scale-[0.98] cursor-pointer animate-pulse"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>标记完成 (Mark Complete)</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#FAF9F6] border border-dashed border-[#E5E5E5] rounded-xl p-8 text-center text-[#999999] space-y-3 shadow-sm">
                            <Coffee className="w-8 h-8 mx-auto text-[#999999]/60" />
                            <div>
                                <p className="text-sm font-bold text-[#111111]">
                                    无推荐行动
                                </p>
                                <p className="text-xs text-[#999999] mt-0.5">
                                    该分类下的所有原子步骤皆已搞定！太棒了！
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 2.4 Task List Column (Today's Actions / Atomic Actions) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
                            <h2 className="text-base font-semibold text-[#111111] flex items-center space-x-2">
                                <CheckSquare className="w-4 h-4 text-[#1F4D3A]" />
                                <span>
                                    {selectedEntityId === "today"
                                        ? "今日总行动 (Today's Actions)"
                                        : "待办微行动 (Atomic Actions)"}
                                </span>
                            </h2>
                            <span className="text-xs text-[#999999] font-medium font-mono">
                                {
                                    filteredTasks.filter(
                                        (t) => t.status !== "completed",
                                    ).length
                                }{" "}
                                待办 /{" "}
                                {
                                    filteredTasks.filter(
                                        (t) => t.status === "completed",
                                    ).length
                                }{" "}
                                已完成
                            </span>
                        </div>

                        {filteredTasks.length === 0 ? (
                            <div className="text-center py-12 border border-dashed border-[#E5E5E5] rounded-xl text-[#999999]">
                                <Coffee className="w-8 h-8 mx-auto text-[#999999] mb-3 opacity-60" />
                                <p className="text-sm font-medium">
                                    当前模块无待办行动
                                </p>
                                <p className="text-xs mt-1 text-[#999999]">
                                    输入你的目标，让 AI 为您分担压力。
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {/* Pending and started tasks */}
                                {filteredTasks.map((task) => {
                                    const isStarted = task.status === "started";
                                    const isCompleted =
                                        task.status === "completed";
                                    const isJustCompleted =
                                        justCompletedIds.includes(task.id);
                                    const tag = getCognitiveTag(
                                        task.priority,
                                        task.estimated_minutes,
                                    );
                                    const parentEntity = entities.find(
                                        (e) => e.id === task.entity_id,
                                    );

                                    return (
                                        <div
                                            key={task.id}
                                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                                isJustCompleted
                                                    ? "animate-task-complete border-[#1F4D3A]/30 bg-[#1F4D3A]/5 shadow-sm"
                                                    : isCompleted
                                                      ? "bg-[#E5E5E5]/20 border-[#E5E5E5]/60 opacity-60"
                                                      : isStarted
                                                        ? "bg-[#1F4D3A]/5 border-[#1F4D3A]/30 shadow-sm ring-[0.5px] ring-[#1F4D3A]/20"
                                                        : "bg-[#FAF9F6] border-[#E5E5E5] hover:border-[#1F4D3A]/30"
                                            }`}
                                        >
                                            <div className="flex items-center space-x-3 min-w-0">
                                                {/* Checkbox selector */}
                                                <button
                                                    onClick={() => {
                                                        if (!isCompleted) {
                                                            handleCompleteTask(
                                                                task.id,
                                                            );
                                                        }
                                                    }}
                                                    disabled={isCompleted}
                                                    className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                                        isJustCompleted
                                                            ? "animate-check-burst bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                            : isCompleted
                                                              ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                              : isStarted
                                                                ? "border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#1F4D3A]/10"
                                                                : "border-[#999999] hover:border-[#1F4D3A] text-transparent"
                                                    }`}
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>

                                                <div className="min-w-0">
                                                    <p
                                                        className={`text-[15px] font-medium leading-normal ${
                                                            isCompleted
                                                                ? "line-through text-[#999999]"
                                                                : "text-[#111111]"
                                                        }`}
                                                    >
                                                        {task.title}
                                                    </p>
                                                    {task.done_criteria && (
                                                        <p
                                                            className={`text-xs mt-1 text-[#666666] bg-[#FAF9F6]/80 border border-[#E5E5E5]/60 rounded-md px-2 py-0.5 max-w-fit shadow-2xs leading-relaxed ${
                                                                isCompleted
                                                                    ? "line-through opacity-70 border-transparent bg-transparent text-[#999999]/80 font-normal"
                                                                    : ""
                                                            }`}
                                                        >
                                                            <span className="text-[#1F4D3A] font-semibold">
                                                                🎯
                                                                完成标准:{" "}
                                                            </span>
                                                            <span>
                                                                 {
                                                                     task.done_criteria
                                                                 }
                                                             </span>
                                                         </p>
                                                     )}
                                                     <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#999999] font-medium">
                                                         <span
                                                             className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${tag.style}`}
                                                         >
                                                             {tag.label}
                                                         </span>
                                                         <span className="flex items-center space-x-1">
                                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                                            <span>
                                                                {
                                                                    task.estimated_minutes
                                                                }{" "}
                                                                分钟
                                                            </span>
                                                        </span>
                                                        {selectedEntityId ===
                                                            "today" &&
                                                            parentEntity && (
                                                                <span className="text-[10px] text-[#666666] bg-[#E5E5E5]/40 px-1.5 py-0.5 rounded">
                                                                    📂{" "}
                                                                    {
                                                                        parentEntity.title
                                                                    }
                                                                </span>
                                                            )}
                                                        {isStarted && (
                                                            <span className="text-[#1F4D3A] flex items-center space-x-1 animate-pulse">
                                                                <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                                                                <span>
                                                                    进行中...
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action trigger button */}
                                            {!isCompleted && (
                                                <div className="shrink-0 ml-4">
                                                    {!isStarted ? (
                                                        <button
                                                            onClick={() =>
                                                                 handleStartTask(
                                                                     task.id,
                                                                 )
                                                             }
                                                             className="px-3 py-1.5 bg-[#1F4D3A]/10 hover:bg-[#1F4D3A] text-[#1F4D3A] hover:text-[#FAF9F6] font-medium rounded-lg text-xs transition-all duration-150 flex items-center space-x-1 cursor-pointer border-none"
                                                         >
                                                             <Play className="w-3 h-3 fill-current" />
                                                             <span>开始</span>
                                                         </button>
                                                     ) : (
                                                         <button
                                                             onClick={() =>
                                                                 handleCompleteTask(
                                                                     task.id,
                                                                 )
                                                             }
                                                             className="px-3 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-medium rounded-lg text-xs transition-all duration-150 flex items-center space-x-1 cursor-pointer border-none"
                                                         >
                                                             <Check className="w-3.5 h-3.5" />
                                                             <span>完成</span>
                                                         </button>
                                                     )}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         )}
                     </div>
                 
                        </>
                    )}
</section>
             </main>

            {isRightPanelOpen && (
                <aside className="w-[320px] border-l border-[#E5E5E5] bg-[#FAF9F6] p-6 flex flex-col justify-between overflow-y-auto shrink-0 select-none border-dashed border-l-[#E5E5E5]">
                    {/* Core AI Section */}
                    <div className="space-y-6">
                        <div className="flex items-center space-x-2 border-b border-[#E5E5E5] pb-4">
                            <div className="w-6 h-6 rounded bg-[#1F4D3A] flex items-center justify-center text-[#FAF9F6]">
                                <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-bold text-[#111111] tracking-tight text-sm uppercase">
                                Execution Coach
                            </span>
                        </div>

                        {/* 3.1 Momentum Tracker - Feedback loops */}
                        <div className="space-y-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
                                行动动量评估 (Momentum Tracker)
                            </span>

                            <div className="bg-[#FAF9F6] border border-[#1F4D3A]/20 hover:border-[#1F4D3A]/30 rounded-xl p-5 shadow-sm space-y-4 transition-all duration-150 bg-gradient-to-br from-[#FAF9F6] to-[#1F4D3A]/3">
                                <div className="flex items-center space-x-2 text-[#1F4D3A] text-xs font-bold bg-[#1F4D3A]/10 px-2 py-1 rounded w-fit">
                                    <TrendingUp className="w-4 h-4 animate-bounce" />
                                    <span>{momentumStatus}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 text-center">
                                    <div className="bg-[#FAF9F6] border border-[#1F4D3A]/15 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center transition-all hover:scale-[1.03]">
                                        <span className="text-[9px] text-[#666666] font-semibold leading-none">
                                            连续行动
                                        </span>
                                        <span className="text-2xl font-black text-[#1F4D3A] mt-2 font-mono">
                                            {maxHabitStreak}
                                        </span>
                                        <span className="text-[8px] text-[#999999] mt-0.5">
                                            天
                                        </span>
                                    </div>

                                    <div className="bg-[#FAF9F6] border border-[#1F4D3A]/15 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center transition-all hover:scale-[1.03]">
                                        <span className="text-[9px] text-[#666666] font-semibold leading-none">
                                            累计完成
                                        </span>
                                        <span className="text-2xl font-black text-[#1F4D3A] mt-2 font-mono">
                                            {completedTasks.length}
                                        </span>
                                        <span className="text-[8px] text-[#999999] mt-0.5">
                                            个
                                        </span>
                                    </div>

                                    <div className="bg-[#FAF9F6] border border-[#1F4D3A]/15 rounded-xl p-3 shadow-xs flex flex-col justify-between items-center transition-all hover:scale-[1.03]">
                                        <span className="text-[9px] text-[#666666] font-semibold leading-none">
                                            平均启动
                                        </span>
                                        <span className="text-2xl font-black text-[#1F4D3A] mt-2 font-mono">
                                            {avgStartMinutes > 0 ? avgStartMinutes : "—"}
                                        </span>
                                        <span className="text-[8px] text-[#999999] mt-0.5">
                                            {avgStartMinutes > 0 ? "分钟" : "数据不足"}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-[10px] leading-relaxed text-[#666666]">
                                    {avgStartMinutes > 0 ? (
                                        <>
                                            📈 <strong>动量分析</strong>：您创建任务后通常在 <strong>{avgStartMinutes} 分钟内</strong>立即启动。展示了优异的无延迟启动惯性，请继续保持单线程专注于单项原子微行动！
                                        </>
                                    ) : (
                                        <>
                                            📈 <strong>动量分析</strong>：分析引擎已就绪。当您创建任务并点击“开始”启动后，系统将为您精准捕获首个启动时效并在此生成动量洞察！
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* 3.2 Action Coach Diagnostic Cards - GROW coaching stance */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[#999999]">
                                    执行教练觉察 (GROW Coaching)
                                </span>
                                <span className="text-[8px] text-[#1F4D3A] bg-[#1F4D3A]/10 px-1.5 py-0.5 rounded font-mono font-bold select-none">
                                    3:1 POSITIVE FEEDBACK
                                </span>
                            </div>

                            {/* Diagnostic Card 1: Project Action Opportunity */}
                            <div className="bg-[#FAF9F6] border border-[#E5E5E5] hover:border-[#1F4D3A]/30 rounded-xl p-4.5 flex items-start space-x-3.5 transition-all duration-150 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 shadow-2xs">
                                    <AlertCircle className="w-4.5 h-4.5" />
                                </div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <h5 className="text-xs font-bold text-[#111111] flex items-center justify-between">
                                        <span>{projectDiagnostic.title}</span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded select-none ${projectDiagnostic.badgeColorClass}`}>
                                            {projectDiagnostic.badge}
                                        </span>
                                    </h5>
                                    <p className="text-xs text-[#666666] leading-relaxed">
                                        {projectDiagnostic.desc}
                                    </p>
                                    <div className="text-[10px] text-[#245C47] bg-[#1F4D3A]/5 border-l-3 border-[#1F4D3A] p-2.5 rounded-r mt-2 leading-relaxed">
                                        {projectDiagnostic.growText}
                                    </div>
                                </div>
                            </div>

                            {/* Diagnostic Card 2: Attention Residue */}
                            <div className="bg-[#FAF9F6] border border-[#E5E5E5] hover:border-[#1F4D3A]/30 rounded-xl p-4.5 flex items-start space-x-3.5 transition-all duration-150 shadow-2xs">
                                <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#1F4D3A]/20 flex items-center justify-center shrink-0 text-[#1F4D3A] shadow-2xs">
                                    <Brain className="w-4.5 h-4.5" />
                                </div>
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <h5 className="text-xs font-bold text-[#111111] flex items-center justify-between">
                                        <span>{attentionDiagnostic.title}</span>
                                        <span className={`text-[8px] px-1.5 py-0.5 rounded select-none ${attentionDiagnostic.badgeColorClass}`}>
                                            {attentionDiagnostic.badge}
                                        </span>
                                    </h5>
                                    <p className="text-xs text-[#666666] leading-relaxed">
                                        {attentionDiagnostic.desc}
                                    </p>
                                    <div className="text-[10px] text-[#245C47] bg-[#1F4D3A]/5 border-l-3 border-[#1F4D3A] p-2.5 rounded-r mt-2 leading-relaxed">
                                        {attentionDiagnostic.growText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Brand footer tagline */}
                    <div className="border-t border-[#E5E5E5] pt-4 text-center">
                        <p className="text-[10px] font-semibold text-[#999999] uppercase tracking-widest font-mono">
                            CLARITY DESIGN SYSTEM V1.3
                        </p>
                        <p className="text-[9px] text-[#999999] mt-1">
                            Focus is a quiet, powerful state.
                        </p>
                    </div>
                </aside>
            )}


            {/* ========================================================================= */}
            {/* 4. ONBOARDING WIZARD MODAL DIALOG                                         */}
            {/* ========================================================================= */}
            {isAddingHabit && (
                <div className="fixed inset-0 bg-[#111111]/45 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
                    <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-fade-in flex flex-col justify-between max-h-[90vh]">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 mb-4 shrink-0">
                            <div>
                                <h3 className="text-base font-bold text-[#111111]">
                                    创建日常习惯向导 (Habit Wizard)
                                </h3>
                                <p className="text-xs text-[#999999] mt-0.5">
                                    3 步建立你的每日生活事件锚定循环
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddingHabit(false)}
                                className="text-[#999999] hover:text-[#111111] text-sm cursor-pointer bg-transparent border-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Steps indicator */}
                        <div className="flex items-center space-x-2 mb-6 select-none shrink-0">
                            {[0, 1, 2].map((s) => (
                                <div
                                    key={s}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                                        s === onboardingStep
                                            ? "bg-[#1F4D3A] scale-110"
                                            : s < onboardingStep
                                              ? "bg-[#1D9E75]"
                                              : "bg-[#E5E5E5]"
                                    }`}
                                />
                            ))}
                            <span className="text-xs text-[#999999] font-medium font-mono pl-2">
                                第 {onboardingStep + 1} 步 / 共 3 步
                            </span>
                        </div>

                        {/* Step Contents */}
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-6 scrollbar-thin">
                            {/* STEP 1: Name, Goal, Frequency */}
                            {onboardingStep === 0 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            给这个习惯起个名字
                                        </label>
                                        <input
                                            type="text"
                                            value={newHabitName}
                                            onChange={(e) =>
                                                setNewHabitName(e.target.value)
                                            }
                                            placeholder="例：正念呼吸、清晨跑、睡前拉伸..."
                                            className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-3 text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#1F4D3A] focus:border-[#1F4D3A]"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            它属于哪个长期目标？
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {entities
                                                .filter(
                                                    (e) => e.type === "goal",
                                                )
                                                .map((goal) => (
                                                    <button
                                                        key={goal.id}
                                                        type="button"
                                                        onClick={() =>
                                                            setNewHabitGoal(
                                                                goal.title,
                                                            )
                                                        }
                                                        className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150 ${
                                                            newHabitGoal ===
                                                            goal.title
                                                                ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                                : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                        }`}
                                                    >
                                                        {goal.title}
                                                    </button>
                                                ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const title =
                                                        prompt(
                                                            "请输入新目标名称:",
                                                        );
                                                    if (title?.trim()) {
                                                        setNewHabitGoal(
                                                            title.trim(),
                                                        );
                                                    }
                                                }}
                                                className="px-3 py-1.5 rounded-full border border-[#E5E5E5] border-dashed text-xs text-[#999999] hover:border-[#1F4D3A] hover:text-[#1F4D3A] cursor-pointer bg-transparent"
                                            >
                                                + 新建目标
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            执行频率
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                {
                                                    value: "daily",
                                                    label: "每天",
                                                },
                                                {
                                                    value: "workday",
                                                    label: "工作日",
                                                },
                                                {
                                                    value: "mon_wed_fri",
                                                    label: "周一三五",
                                                },
                                                {
                                                    value: "weekly",
                                                    label: "每周",
                                                },
                                            ].map((freq) => (
                                                <button
                                                    key={freq.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setNewHabitFreq(
                                                            freq.value as any,
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150 ${
                                                        newHabitFreq ===
                                                        freq.value
                                                            ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                            : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                    }`}
                                                >
                                                    {freq.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Anchor, Duration, Misses */}
                            {onboardingStep === 1 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider flex flex-col">
                                            <span>
                                                生活事件锚点 (Behavior Trigger)
                                            </span>
                                            <span className="text-[10px] text-[#999999] normal-case mt-1 leading-normal font-normal">
                                                选生活起居事件而非固定时间——这样即使晚起或作息微调，习惯也不会轻易中断失效！
                                            </span>
                                        </label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {[
                                                "起床后",
                                                "早餐后",
                                                "午餐后",
                                                "工作结束后",
                                                "晚餐后",
                                                "睡前",
                                            ].map((anchor) => (
                                                <button
                                                    key={anchor}
                                                    type="button"
                                                    onClick={() =>
                                                        setNewHabitAnchor(
                                                            anchor,
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150 ${
                                                        newHabitAnchor ===
                                                        anchor
                                                            ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                            : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                    }`}
                                                >
                                                    {anchor}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            参考时长
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[5, 10, 20, 30, 45].map((min) => (
                                                <button
                                                    key={min}
                                                    type="button"
                                                    onClick={() =>
                                                        setNewHabitDuration(min)
                                                    }
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150 ${
                                                        newHabitDuration === min
                                                            ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                            : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                    }`}
                                                >
                                                    {min} 分钟
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            允许漏打卡次数 (断链阈值)
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                {
                                                    val: 0,
                                                    label: "0 次（严格）",
                                                },
                                                { val: 1, label: "1 次" },
                                                { val: 2, label: "2 次" },
                                            ].map((miss) => (
                                                <button
                                                    key={miss.val}
                                                    type="button"
                                                    onClick={() =>
                                                        setNewHabitMiss(
                                                            miss.val,
                                                        )
                                                    }
                                                    className={`px-3 py-1.5 rounded-full border text-xs font-medium cursor-pointer transition-all duration-150 ${
                                                        newHabitMiss ===
                                                        miss.val
                                                            ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                            : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                    }`}
                                                >
                                                    {miss.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Workflow, Completion Phrase */}
                            {onboardingStep === 2 && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            是否有固定的执行步骤 (Workflow)？
                                        </label>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewHabitNeedWF(false)
                                                }
                                                className={`flex-1 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                                    !newHabitNeedWF
                                                        ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                        : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                }`}
                                            >
                                                不需要，一键打卡就好
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewHabitNeedWF(true)
                                                }
                                                className={`flex-1 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                                                    newHabitNeedWF
                                                        ? "bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                        : "border-[#E5E5E5] text-[#666666] hover:border-[#1F4D3A]"
                                                }`}
                                            >
                                                是，添加步骤
                                            </button>
                                        </div>
                                    </div>

                                    {newHabitNeedWF && (
                                        <div className="border border-[#E5E5E5] rounded-xl p-4 bg-[#1F4D3A]/5 space-y-3">
                                            <div className="space-y-2">
                                                {newHabitWFSteps.map(
                                                    (step, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <span className="text-xs font-bold text-[#999999] w-4">
                                                                {idx + 1}
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={
                                                                    step.title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const val =
                                                                        e.target
                                                                            .value;
                                                                    setNewHabitWFSteps(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    s,
                                                                                    sidx,
                                                                                ) =>
                                                                                    sidx ===
                                                                                    idx
                                                                                        ? {
                                                                                              ...s,
                                                                                              title: val,
                                                                                          }
                                                                                        : s,
                                                                            ),
                                                                    );
                                                                }}
                                                                placeholder="例：换好运动装备、拉伸动作..."
                                                                className="flex-1 bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg p-2 text-xs"
                                                            />
                                                            <select
                                                                value={
                                                                    step.minutes
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    const val =
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    setNewHabitWFSteps(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    s,
                                                                                    sidx,
                                                                                ) =>
                                                                                    sidx ===
                                                                                    idx
                                                                                        ? {
                                                                                              ...s,
                                                                                              minutes:
                                                                                                  val,
                                                                                          }
                                                                                        : s,
                                                                            ),
                                                                    );
                                                                }}
                                                                className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-lg p-2 text-xs"
                                                            >
                                                                {[
                                                                    1, 2, 3, 5,
                                                                    10, 15, 20,
                                                                    30,
                                                                ].map((m) => (
                                                                    <option
                                                                        key={m}
                                                                        value={
                                                                            m
                                                                        }
                                                                    >
                                                                        {m}m
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setNewHabitWFSteps(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            prev.filter(
                                                                                (
                                                                                    _,
                                                                                    sidx,
                                                                                ) =>
                                                                                    sidx !==
                                                                                    idx,
                                                                            ),
                                                                    )
                                                                }
                                                                className="text-xs text-red-600 cursor-pointer px-1 bg-transparent border-none"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setNewHabitWFSteps(
                                                        (prev) => [
                                                            ...prev,
                                                            {
                                                                step_num:
                                                                    prev.length +
                                                                    1,
                                                                title: "",
                                                                minutes: 5,
                                                            },
                                                        ],
                                                    )
                                                }
                                                className="text-xs text-[#1F4D3A] hover:underline font-bold cursor-pointer bg-transparent border-none p-0"
                                            >
                                                + 添加新步骤
                                            </button>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[#666666] uppercase tracking-wider">
                                            完成鼓励语（可选）
                                        </label>
                                        <input
                                            type="text"
                                            value={newHabitPhrase}
                                            onChange={(e) =>
                                                setNewHabitPhrase(
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="例：又完成一次！身体在慢慢变强。"
                                            className="w-full bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-3 text-sm text-[#111111] placeholder-[#999999] focus:outline-none focus:ring-1 focus:ring-[#1F4D3A] focus:border-[#1F4D3A]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center border-t border-[#E5E5E5] pt-4 select-none shrink-0">
                            <button
                                type="button"
                                onClick={() =>
                                    setOnboardingStep((prev) =>
                                        Math.max(0, prev - 1),
                                    )
                                }
                                disabled={onboardingStep === 0}
                                className={`px-4 py-2 text-xs font-semibold rounded-xl border ${
                                    onboardingStep === 0
                                        ? "opacity-40 text-[#999999] border-[#E5E5E5] cursor-not-allowed bg-transparent"
                                        : "text-[#666666] border-[#E5E5E5] hover:bg-[#E5E5E5]/20 cursor-pointer bg-transparent"
                                }`}
                            >
                                ← 上一步
                            </button>

                            {onboardingStep === 2 ? (
                                <button
                                    type="button"
                                    onClick={handleSaveHabit}
                                    disabled={!newHabitName.trim()}
                                    className={`px-5 py-2.5 text-xs font-bold rounded-xl text-[#FAF9F6] cursor-pointer shadow ${
                                        !newHabitName.trim()
                                            ? "bg-[#E5E5E5] text-[#999999] cursor-not-allowed shadow-none border-none"
                                            : "bg-[#1D9E75] hover:bg-[#1A8D68] active:scale-[0.98] border-none"
                                    }`}
                                >
                                    完成并建立习惯 ✓
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setOnboardingStep((prev) =>
                                            Math.min(2, prev + 1),
                                        )
                                    }
                                    className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] cursor-pointer shadow active:scale-[0.98] border-none"
                                >
                                    下一步 →
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Completion Success Toast */}
            {completionAlert && (
                <div className="fixed bottom-6 right-6 bg-[#1D9E75] text-[#FAF9F6] border border-[#1A8D68] px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-bounce leading-relaxed select-none">
                    <Check className="w-5 h-5 shrink-0 stroke-[3]" />
                    <div>
                        <p className="text-xs font-bold tracking-wider uppercase opacity-85">
                            打卡成功 · 行动动量 +1
                        </p>
                        <p className="text-[13px] font-semibold mt-0.5">
                            {completionAlert.phrase}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
