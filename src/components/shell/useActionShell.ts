'use client';

import { useState, useEffect } from 'react';
import type { Entity, Task, Routine, HistoryLog, Draft } from '@/lib/db';
import { decomposeAction } from '@/app/actions/aiActions';
import { createHabit, toggleHabitCompletion } from '@/app/actions/habitActions';
import {
  startTaskAction,
  completeTaskAction,
  reorderTasksAction,
  updateTaskAction,
  deleteTaskAction,
  archiveEntityAction,
  addTaskAction,
  addDraftAction,
  deleteDraftAction,
  updateDraftAction,
  decomposeDraftAction,
} from '@/app/actions/taskActions';
import {
  buildAttentionDiagnostic,
  buildProjectDiagnostic,
} from '@/lib/shell/diagnostics';
import { computeMomentum, pickNextAction } from '@/lib/shell/taskUi';

export interface ShellInitialData {
  initialEntities: Entity[];
  initialTasks: Task[];
  initialRoutines: Routine[];
  initialHistoryLogs: HistoryLog[];
  initialDrafts: Draft[];
}

export function useActionShell({
  initialEntities,
  initialTasks,
  initialRoutines,
  initialHistoryLogs,
  initialDrafts,
}: ShellInitialData) {
  // UI State - Default selected view is 'today' for Today-centric workflow
const [entities, setEntities] = useState<Entity[]>(initialEntities);
const [tasks, setTasks] = useState<Task[]>(initialTasks);
const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
const [historyLogs, setHistoryLogs] =
    useState<HistoryLog[]>(initialHistoryLogs);
const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);

// Reactively synchronize state when Next.js server components refresh and pass down new database props
useEffect(() => {
    setEntities(initialEntities);
    setTasks(initialTasks);
    setRoutines(initialRoutines);
    setHistoryLogs(initialHistoryLogs);
    setDrafts(initialDrafts);
}, [initialEntities, initialTasks, initialRoutines, initialHistoryLogs, initialDrafts]);

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

// ADHD Toggles & Focus timer states
const [isAdhdMode, setIsAdhdMode] = useState<boolean>(false);
const [adhdTimeBlindnessAssist, setAdhdTimeBlindnessAssist] = useState<boolean>(true);
const [adhdEmotionalResistanceAssist, setAdhdEmotionalResistanceAssist] = useState<boolean>(true);
const [adhdStreakProtection, setAdhdStreakProtection] = useState<boolean>(true);
const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

const [focusTimerSeconds, setFocusTimerSeconds] = useState<number>(0);
const [focusTimerIsRunning, setFocusTimerIsRunning] = useState<boolean>(false);
const [focusTimerTaskId, setFocusTimerTaskId] = useState<string | null>(null);
const [emotionalResistanceTaskId, setEmotionalResistanceTaskId] = useState<string | null>(null);
const [selectedResistanceReason, setSelectedResistanceReason] = useState<"status" | "pointless" | "time" | "distracted" | null>(null);
const [focusShowAllTasks, setFocusShowAllTasks] = useState<boolean>(false);
const [showCompletedTasks, setShowCompletedTasks] = useState<boolean>(false);

// Shutdown Ritual States
const [showShutdownModal, setShowShutdownModal] = useState<boolean>(false);
const [shutdownStep, setShutdownStep] = useState<number>(1);
const [shutdownTomorrowFocus, setShutdownTomorrowFocus] = useState<string>("");

// Auto-trigger shutdown modal after 20:00 once per day
useEffect(() => {
    const todayStr = new Date().toLocaleDateString("en-CA");
    const hasDoneToday = localStorage.getItem(`shutdown_done_${todayStr}`);
    const hour = new Date().getHours();
    if (hour >= 20 && !hasDoneToday) {
        setShowShutdownModal(true);
    }
}, []);

// Inline Task Editing states
const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
const [editTitle, setEditTitle] = useState<string>("");
const [editDoneCriteria, setEditDoneCriteria] = useState<string>("");
const [editMinutes, setEditMinutes] = useState<number>(15);
const [editPriority, setEditPriority] = useState<"P1" | "P2" | "P3">("P1");

// React countdown timer for ADHD time blindness assist
useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusTimerIsRunning && focusTimerSeconds > 0) {
        interval = setInterval(() => {
            setFocusTimerSeconds((prev) => {
                if (prev <= 1) {
                    setFocusTimerIsRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
}, [focusTimerIsRunning, focusTimerSeconds]);

// Active Entity details (dynamically falls back to Today view)
// For the Today view, derive today_focus from the entity that has the
// highest-priority PENDING task — not from a stale entities[0] field.
const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "started"
);
const priorityOrder = { P1: 0, P2: 1, P3: 2 };
const topPendingTask = [...pendingTasks].sort(
    (a, b) =>
        (priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2)
)[0];
const focusEntity = topPendingTask
    ? entities.find((e) => e.id === topPendingTask.entity_id)
    : undefined;
const activeEntity =
    selectedEntityId === "today" || entities.length === 0
        ? {
              id: "today",
              type: "project" as const,
              title: "今日工作区 (Workspace)",
              description: "整合所有维度的全局行动工作台",
              today_focus:
                  focusEntity?.today_focus || "完成今日最值得做的事情",
              why_focus:
                  focusEntity?.why_focus || "保持小步快跑的行动惯性",
          }
        : selectedEntityId === "inbox"
        ? {
              id: "inbox",
              type: "project" as const,
              title: "📥 收集箱与备忘 (Inbox & Backlog)",
              description: "GTD 收集箱、未处理草稿及历史待办池",
              today_focus: "整理并澄清你的收集箱与待办池",
              why_focus: "卸载大脑记忆负担，保持前额叶时刻纯净",
          }
        : entities.find((e) => e.id === selectedEntityId) || entities[0];

// Filtered tasks - Today view merges all tasks bilingually, Project view filters specifically
const filteredTasks =
    selectedEntityId === "today"
        ? tasks.filter((t) => t.status !== 'backlog')
        : tasks.filter((t) => t.entity_id === selectedEntityId && t.status !== 'backlog');

const {
    completedTasks,
    recentWins,
    maxHabitStreak,
    avgStartMinutes,
    momentumStatus,
    completedTrend,
    avgStartTrend,
    streakTrend,
} = computeMomentum(tasks, routines);

const projectDiagnostic = buildProjectDiagnostic(entities, tasks);
const attentionDiagnostic = buildAttentionDiagnostic(routines);
const nextAction = pickNextAction(filteredTasks);

// Handle task status updates (cognitive behavior triggers)
const handleStartTask = async (taskId: string) => {
    setActiveTaskId(taskId);
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
        setFocusTimerSeconds(task.estimated_minutes * 60);
        setFocusTimerIsRunning(true);
        setFocusTimerTaskId(taskId);
    }
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
    // Persist to database server-side
    await startTaskAction(taskId);
};

const handleCompleteTask = async (taskId: string) => {
    if (activeTaskId === taskId) {
        setActiveTaskId(null);
    }
    if (focusTimerTaskId === taskId) {
        setFocusTimerIsRunning(false);
        setFocusTimerTaskId(null);
        setFocusTimerSeconds(0);
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
    // Persist to database server-side
    await completeTaskAction(taskId);
};

// Manual editing, deletion, and sorting handlers
const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDoneCriteria(task.done_criteria || "");
    setEditMinutes(task.estimated_minutes);
    setEditPriority(task.priority);
};

const handleSaveEdit = async (taskId: string) => {
    if (!editTitle.trim()) return;

    setTasks((prev) =>
        prev.map((t) => {
            if (t.id === taskId) {
                return {
                    ...t,
                    title: editTitle.trim(),
                    done_criteria: editDoneCriteria.trim() || undefined,
                    estimated_minutes: editMinutes,
                    priority: editPriority,
                };
            }
            return t;
        }),
    );
    setEditingTaskId(null);

    // Persist to database server-side
    await updateTaskAction(taskId, {
        title: editTitle.trim(),
        done_criteria: editDoneCriteria.trim() || undefined,
        estimated_minutes: editMinutes,
        priority: editPriority,
    });
};

const handleDeleteTask = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (activeTaskId === taskId) {
        setActiveTaskId(null);
    }
    if (focusTimerTaskId === taskId) {
        setFocusTimerIsRunning(false);
        setFocusTimerTaskId(null);
        setFocusTimerSeconds(0);
    }

    // Persist to database
    await deleteTaskAction(taskId);
};

const handleMoveTaskUp = async (taskId: string) => {
    const fIndex = filteredTasks.findIndex((t) => t.id === taskId);
    if (fIndex <= 0) return;

    const currentTask = filteredTasks[fIndex];
    const prevTask = filteredTasks[fIndex - 1];

    const indexCurrent = tasks.findIndex((t) => t.id === currentTask.id);
    const indexPrev = tasks.findIndex((t) => t.id === prevTask.id);

    if (indexCurrent === -1 || indexPrev === -1) return;

    const updatedTasks = [...tasks];
    const temp = updatedTasks[indexCurrent];
    updatedTasks[indexCurrent] = updatedTasks[indexPrev];
    updatedTasks[indexPrev] = temp;

    setTasks(updatedTasks);
    await reorderTasksAction(updatedTasks.map((t) => t.id));
};

const handleMoveTaskDown = async (taskId: string) => {
    const fIndex = filteredTasks.findIndex((t) => t.id === taskId);
    if (fIndex === -1 || fIndex >= filteredTasks.length - 1) return;

    const currentTask = filteredTasks[fIndex];
    const nextTask = filteredTasks[fIndex + 1];

    const indexCurrent = tasks.findIndex((t) => t.id === currentTask.id);
    const indexNext = tasks.findIndex((t) => t.id === nextTask.id);

    if (indexCurrent === -1 || indexNext === -1) return;

    const updatedTasks = [...tasks];
    const temp = updatedTasks[indexCurrent];
    updatedTasks[indexCurrent] = updatedTasks[indexNext];
    updatedTasks[indexNext] = temp;

    setTasks(updatedTasks);
    await reorderTasksAction(updatedTasks.map((t) => t.id));
};

const handleArchiveProject = async (projectId: string) => {
    if (!confirm("确定要归档并关闭此项目吗？归档后该项目将不再在侧边栏显示。")) return;

    setEntities((prev) =>
        prev.map((e) => {
            if (e.id === projectId) {
                return { ...e, status: "archived" };
            }
            return e;
        }),
    );
    setSelectedEntityId("today");

    // Persist to database server-side
    await archiveEntityAction(projectId);
};

// ADHD Task skipping & Deferral logic
const handleDeferTask = async (taskId: string) => {
    let nextOrder: Task[] = [];
    setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task) return prev;
        nextOrder = [...prev.filter((t) => t.id !== taskId), task];
        return nextOrder;
    });

    // Persist the new order in the database
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
        const ids = [...tasks.filter((t) => t.id !== taskId), task].map((t) => t.id);
        await reorderTasksAction(ids);
    }
};

const handleSkipFocusTask = (taskId: string) => {
    if (isAdhdMode && adhdEmotionalResistanceAssist) {
        setEmotionalResistanceTaskId(taskId);
        setSelectedResistanceReason(null);
    } else {
        handleDeferTask(taskId);
    }
};

// Adopt coach suggestion handler
const handleAdoptCoachSuggestion = async (diagnostic: {
    actionType?: string;
    taskId?: string;
    projectId?: string;
    habitId?: string;
    taskTitle?: string;
    estimatedMinutes?: number;
    priority?: "P1" | "P2" | "P3";
    doneCriteria?: string;
}) => {
    if (diagnostic.actionType === 'startTask' && diagnostic.taskId) {
        await handleStartTask(diagnostic.taskId);
    } else if (diagnostic.actionType === 'startHabit' && diagnostic.habitId) {
        await handleToggleHabit(diagnostic.habitId);
    } else if (diagnostic.actionType === 'addTask') {
        const entId = diagnostic.projectId || 'today';
        const newTaskData = {
            id: `t_${Date.now()}`,
            entity_id: entId,
            title: diagnostic.taskTitle || "新微任务",
            estimated_minutes: diagnostic.estimatedMinutes || 15,
            priority: diagnostic.priority || "P1",
            done_criteria: diagnostic.doneCriteria || "未设定具体判定标准",
        };
        
        // Optimistically update tasks state
        setTasks((prev) => [...prev, { ...newTaskData, status: 'pending', created_at: new Date().toISOString() }]);
        
        // Server Action call
        await addTaskAction(newTaskData);
    }
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

  // --- Drafts Handlers ---
  const handleAddDraft = async (content: string) => {
    if (!content.trim()) return;
    try {
      const result = await addDraftAction(content.trim());
      if (result.success && result.draft) {
        setDrafts((prev) => [...prev, result.draft as Draft]);
        setInputText(""); // Clear capture textarea
      }
    } catch (err) {
      console.error("Error adding draft:", err);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      const result = await deleteDraftAction(id);
      if (result.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Error deleting draft:", err);
    }
  };

  const handleUpdateDraft = async (id: string, content: string) => {
    try {
      const result = await updateDraftAction(id, content);
      if (result.success && result.draft) {
        setDrafts((prev) => prev.map((d) => (d.id === id ? (result.draft as Draft) : d)));
      }
    } catch (err) {
      console.error("Error updating draft:", err);
    }
  };

  const handleDecomposeDraft = async (draftId: string) => {
    setIsDecomposing(true);
    setShowChaosAnimation(true);
    try {
      const result = await decomposeDraftAction(draftId);
      if (result.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftId));
        setSelectedEntityId("today"); // Switch view back to Today workspace
        if ('loadMessage' in result && result.loadMessage) {
          alert(result.loadMessage);
        }
      } else {
        alert(`智能拆解失败: ${result.error}`);
      }
    } catch (err) {
      console.error("Error decomposing draft:", err);
    } finally {
      setShowChaosAnimation(false);
      setIsDecomposing(false);
    }
  };

  // --- Shutdown Ritual Handlers ---
  const handleShutdownMoveToTomorrow = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: "pending", created_at: new Date().toISOString() };
        }
        return t;
      })
    );
    await updateTaskAction(taskId, { status: "pending", created_at: new Date().toISOString() });
  };

  const handleShutdownMoveToBacklog = async (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          return { ...t, status: "backlog", backlog_reason: "deferred" };
        }
        return t;
      })
    );
    await updateTaskAction(taskId, { status: "backlog", backlog_reason: "deferred" });
  };

  const handleShutdownComplete = async () => {
    if (shutdownTomorrowFocus.trim()) {
      const newTask = {
        id: `t_${Date.now()}`,
        entity_id: "today",
        title: shutdownTomorrowFocus.trim(),
        estimated_minutes: 15,
        priority: "P1" as const,
        done_criteria: "达成明天最核心聚焦行动的目标",
      };
      setTasks((prev) => [...prev, { ...newTask, status: "pending", created_at: new Date().toISOString() }]);
      await addTaskAction(newTask);
    }

    const todayStr = new Date().toLocaleDateString("en-CA");
    localStorage.setItem(`shutdown_done_${todayStr}`, "true");

    setShowShutdownModal(false);
    setShutdownStep(1);
    setShutdownTomorrowFocus("");
  };

  return {
    entities,
    setEntities,
    tasks,
    setTasks,
    routines,
    setRoutines,
    historyLogs,
    selectedEntityId,
    setSelectedEntityId,
    inputText,
    setInputText,
    isDecomposing,
    activeTaskId,
    showChaosAnimation,
    justCompletedIds,
    isRightPanelOpen,
    setIsRightPanelOpen,
    isFocusMode,
    setIsFocusMode,
    isAddingHabit,
    setIsAddingHabit,
    onboardingStep,
    setOnboardingStep,
    newHabitName,
    setNewHabitName,
    newHabitGoal,
    setNewHabitGoal,
    newHabitFreq,
    setNewHabitFreq,
    newHabitAnchor,
    setNewHabitAnchor,
    newHabitDuration,
    setNewHabitDuration,
    newHabitMiss,
    setNewHabitMiss,
    newHabitNeedWF,
    setNewHabitNeedWF,
    newHabitWFSteps,
    setNewHabitWFSteps,
    newHabitPhrase,
    setNewHabitPhrase,
    expandedHabitIds,
    completionAlert,
    setCompletionAlert,
    isAdhdMode,
    setIsAdhdMode,
    adhdTimeBlindnessAssist,
    setAdhdTimeBlindnessAssist,
    adhdEmotionalResistanceAssist,
    setAdhdEmotionalResistanceAssist,
    adhdStreakProtection,
    setAdhdStreakProtection,
    isSettingsOpen,
    setIsSettingsOpen,
    focusTimerSeconds,
    focusTimerIsRunning,
    focusTimerTaskId,
    emotionalResistanceTaskId,
    setEmotionalResistanceTaskId,
    selectedResistanceReason,
    setSelectedResistanceReason,
    focusShowAllTasks,
    setFocusShowAllTasks,
    showCompletedTasks,
    setShowCompletedTasks,
    editingTaskId,
    setEditingTaskId,
    editTitle,
    setEditTitle,
    editDoneCriteria,
    setEditDoneCriteria,
    editMinutes,
    setEditMinutes,
    editPriority,
    setEditPriority,
    activeEntity,
    filteredTasks,
    completedTasks,
    recentWins,
    maxHabitStreak,
    avgStartMinutes,
    momentumStatus,
    projectDiagnostic,
    attentionDiagnostic,
    nextAction,
    handleStartTask,
    handleCompleteTask,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteTask,
    handleMoveTaskUp,
    handleMoveTaskDown,
    handleArchiveProject,
    handleDeferTask,
    handleSkipFocusTask,
    handleAdoptCoachSuggestion,
    handleToggleHabit,
    handleSaveHabit,
    toggleHabitSteps,
    handleDecompose,
    
    // Drafts exports
    drafts,
    setDrafts,
    handleAddDraft,
    handleDeleteDraft,
    handleUpdateDraft,
    handleDecomposeDraft,

    // Shutdown exports
    showShutdownModal,
    setShowShutdownModal,
    shutdownStep,
    setShutdownStep,
    shutdownTomorrowFocus,
    setShutdownTomorrowFocus,
    handleShutdownMoveToTomorrow,
    handleShutdownMoveToBacklog,
    handleShutdownComplete,

    // Trend exports
    completedTrend,
    avgStartTrend,
    streakTrend,
  };
}

export type ActionShell = ReturnType<typeof useActionShell>;
