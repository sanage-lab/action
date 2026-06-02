'use client';

import { Sparkles, Clock, Play, Check, Coffee, ChevronRight, ChevronUp, ChevronDown, Edit2, Trash2, Archive, Brain, AlertCircle, CheckSquare, RefreshCw, Inbox } from 'lucide-react';
import NextActionCard from '@/components/shell/NextActionCard';
import { getCognitiveTag } from '@/lib/shell/taskUi';
import type { ActionShell } from '@/components/shell/useActionShell';

interface WorkspacePanelProps {
  shell: ActionShell;
}

export default function WorkspacePanel({ shell }: WorkspacePanelProps) {
  const {
    activeEntity,
    filteredTasks,
    tasks,
    entities,
    routines,
    selectedEntityId,
    isFocusMode,
    setIsFocusMode,
    isRightPanelOpen,
    setIsRightPanelOpen,
    nextAction,
    inputText,
    setInputText,
    isDecomposing,
    showChaosAnimation,
    handleDecompose,
    handleStartTask,
    handleCompleteTask,
    handleStartEdit,
    handleSaveEdit,
    handleDeleteTask,
    handleMoveTaskUp,
    handleMoveTaskDown,
    handleArchiveProject,
    handleSkipFocusTask,
    handleDeferTask,
    handleToggleHabit,
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
    justCompletedIds,
    showCompletedTasks,
    setShowCompletedTasks,
    expandedHabitIds,
    toggleHabitSteps,
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
    activeTaskId,
    completedTasks,
    setIsAddingHabit,
    setOnboardingStep,
    setNewHabitName,
    setNewHabitPhrase,
    
    // Drafts
    drafts,
    handleAddDraft,
    handleDeleteDraft,
    handleUpdateDraft,
    handleDecomposeDraft,

    // Shutdown
    showShutdownModal,
    setShowShutdownModal,
    shutdownStep,
    setShutdownStep,
    shutdownTomorrowFocus,
    setShutdownTomorrowFocus,
    handleShutdownMoveToTomorrow,
    handleShutdownMoveToBacklog,
    handleShutdownComplete,
  } = shell;
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-[#FAF9F6] relative">
        {/* Workspace Header */}
        <header className="h-[73px] border-b border-[#E5E5E5] px-8 flex items-center justify-between bg-[#FAF9F6] shrink-0">
            <div>
                <h1 className="text-xl font-bold text-[#111111] tracking-tight">
                    {activeEntity.title}
                </h1>
            </div>
    
            <div className="flex items-center space-x-4">
                {/* Simplified completion percentage label */}
                <div className="text-xs font-semibold text-[#666666] bg-[#E5E5E5]/40 px-3 py-1.5 rounded-lg border border-[#E5E5E5] select-none font-mono">
                    完成率：
                    <strong className="text-[#1F4D3A] font-bold">
                        {filteredTasks.length > 0
                            ? `${Math.round((filteredTasks.filter((t) => t.status === "completed").length / filteredTasks.length) * 100)}%`
                            : "0%"}
                    </strong>
                </div>

                {/* Manual Shutdown Ritual Button */}
                <button
                    onClick={() => {
                        setShutdownStep(1);
                        setShowShutdownModal(true);
                    }}
                    className="p-2 rounded-lg border border-[#E5E5E5] bg-[#FAF9F6] text-[#666666] hover:bg-[#E5E5E5]/40 transition-all flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    title="手动开启今日收盘仪式"
                >
                    <Clock className="w-5 h-5 shrink-0" />
                </button>
    
                {/* Collapsible Coach Toggle Button (minimal brain button with icon) */}
                <button
                    onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
                    className={`p-2 rounded-lg border transition-all duration-150 flex items-center justify-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                        isRightPanelOpen
                            ? "bg-[#1F4D3A]/10 text-[#1F4D3A] border-[#1F4D3A]/20"
                            : "bg-[#FAF9F6] text-[#666666] border-[#E5E5E5] hover:bg-[#E5E5E5]/40"
                    }`}
                    title={isRightPanelOpen ? "收起执行教练" : "展开执行教练"}
                >
                    <Brain className="w-5 h-5 shrink-0" />
                </button>
            </div>
        </header>
    
        {/* Central Workspace Area */}
        <section className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
            {selectedEntityId === "inbox" ? (
                /* Inbox view: Draft Box and Backlog List */
                <div className="space-y-6">
                    {/* Draft Box Section */}
                    <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2 border-b border-[#E5E5E5] pb-2 select-none">
                            <Inbox className="w-4 h-4 text-[#1F4D3A]" />
                            <span>未处理草稿箱 (Capture Drafts)</span>
                        </h3>
                        {drafts.length === 0 ? (
                            <p className="text-xs text-[#999999] italic py-4 text-center select-none">
                                没有未处理的草稿。大脑很干净 ✨
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {drafts.map((draft) => (
                                    <div key={draft.id} className="p-4 rounded-xl border border-[#E5E5E5] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 text-sm text-[#333333] whitespace-pre-wrap leading-relaxed">
                                            {draft.content}
                                        </div>
                                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                                            <button
                                                onClick={() => {
                                                    const newContent = prompt("编辑草稿", draft.content);
                                                    if (newContent !== null && newContent.trim()) {
                                                        handleUpdateDraft(draft.id, newContent);
                                                    }
                                                }}
                                                className="px-3 py-1.5 border border-[#E5E5E5] hover:bg-[#E5E5E5]/20 text-[#666666] text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-transparent"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDraft(draft.id)}
                                                className="px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer bg-transparent"
                                            >
                                                删除
                                            </button>
                                            <button
                                                onClick={() => handleDecomposeDraft(draft.id)}
                                                disabled={isDecomposing}
                                                className="px-3.5 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1 shadow-sm border-none disabled:opacity-50"
                                            >
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>AI 拆解</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Backlog Section */}
                    <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-[#111111] flex items-center space-x-2 border-b border-[#E5E5E5] pb-2 select-none">
                            <Clock className="w-4 h-4 text-[#1F4D3A]" />
                            <span>延迟与历史待办池 (Backlog Tasks)</span>
                        </h3>
                        {(() => {
                            const backlogTasks = tasks.filter((t) => t.status === "backlog");
                            if (backlogTasks.length === 0) {
                                return (
                                    <p className="text-xs text-[#999999] italic py-4 text-center select-none">
                                        暂无历史积压 of the 待办任务。今日事今日毕 👏
                                    </p>
                                );
                            }
                            return (
                                <div className="space-y-2">
                                    {backlogTasks.map((task) => {
                                        const tag = getCognitiveTag(task.priority, task.estimated_minutes);
                                        return (
                                            <div key={task.id} className="p-4 rounded-xl border border-[#E5E5E5] bg-white flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-[#111111]">{task.title}</p>
                                                    <div className="flex items-center space-x-2 text-[10px] text-[#999999] font-medium">
                                                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${tag.style}`}>
                                                            {tag.label}
                                                        </span>
                                                        <span>{task.estimated_minutes} 分钟</span>
                                                        {task.backlog_reason && (
                                                            <span className="bg-[#A32D2D]/10 text-[#A32D2D] px-1.5 py-0.5 rounded font-bold font-mono">
                                                                {task.backlog_reason === 'deferred' ? '延迟积压' : '溢出待办'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 shrink-0">
                                                    <button
                                                        onClick={async () => {
                                                            await handleShutdownMoveToTomorrow(task.id);
                                                        }}
                                                        className="px-3 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border-none"
                                                    >
                                                        激活至今天
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="p-1.5 text-[#999999] hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer bg-transparent border-none"
                                                        title="删除"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            ) : (
                <>
                    {/* Workspace Global Header Row (Mode Switcher) */}
                    <div className="flex justify-between items-center pb-2 border-b border-[#E5E5E5]/60">
                <div className="text-xs text-[#666666] font-medium">
                    {isFocusMode ? "🌱 专注模式：拒绝干扰，只做下一步" : "📋 任务清单：规划与整理你的微行动"}
                </div>
                {/* Mode Switcher */}
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
    
            {isFocusMode ? (
                /* Focus Mode Immersive Render */
                <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] animate-fade-in p-4 w-full">
                    {nextAction ? (
                        <NextActionCard
                            task={nextAction}
                            variant="focus"
                            onStart={handleStartTask}
                            onComplete={handleCompleteTask}
                        />
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
                    {/* Sticky Next Action Card at the top of Standard Mode */}
                    {nextAction && (
                        <NextActionCard
                            task={nextAction}
                            variant="standard"
                            onStart={handleStartTask}
                            onComplete={handleCompleteTask}
                        />
                    )}
                    
            {/* 2.1 PERMANENT GLOBAL CAPTURE INPUT CARD - Answering GTD Capture & Cognitive Offloading */}
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 pointer-events-none">
                    <Sparkles className="w-5 h-5 text-[#1F4D3A]/20" />
                </div>
    
                <h3 className="text-sm font-semibold text-[#111111] mb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-[#1F4D3A]" />
                    <span>
                        你现在脑子里在想什么？(What’s on your mind?)
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
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => handleAddDraft(inputText)}
                                disabled={
                                    isDecomposing || !inputText.trim()
                                }
                                className={`px-4 py-2 rounded-lg text-sm font-medium border border-[#E5E5E5] transition-all duration-150 flex items-center space-x-2 cursor-pointer bg-white text-[#555555] hover:bg-[#E5E5E5]/40 active:scale-[0.98] ${
                                    isDecomposing || !inputText.trim()
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                <span>先存入草稿箱</span>
                            </button>
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
    
            {/* 2.3 Next Action Card - Relocated to top sticky container. If empty, show fuel filler diagnostic here */}
            {!nextAction && (
                <div className="bg-[#FAF9F6] border border-dashed border-[#E5E5E5] rounded-xl p-8 text-center text-[#999999] space-y-4 shadow-sm">
                    <Coffee className="w-8 h-8 mx-auto text-[#999999]/60" />
                    <div>
                        <p className="text-sm font-bold text-[#111111]">
                            无推荐行动
                        </p>
                        <p className="text-xs text-[#999999] mt-0.5">
                            该分类下的所有原子步骤皆已搞定！太棒了！
                        </p>
                    </div>
                    {selectedEntityId !== "today" && activeEntity.type === "project" && filteredTasks.length > 0 && (
                        <button
                            onClick={() => handleArchiveProject(activeEntity.id)}
                            className="mx-auto px-4 py-2.5 bg-[#1F4D3A] hover:bg-[#245C47] text-white font-semibold text-xs rounded-lg transition-all duration-150 flex items-center space-x-1.5 cursor-pointer shadow-sm border-none"
                        >
                            <Archive className="w-3.5 h-3.5" />
                            <span>📂 一键归档并结案该项目</span>
                        </button>
                    )}
                </div>
            )}
    
            {/* 2.4 Task List Column (Today’s Actions / Atomic Actions) */}
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
    
                {(() => {
                    const pendingAndStartedTasks = filteredTasks.filter(t => t.status !== "completed");
                    const completedTasksList = filteredTasks.filter(t => t.status === "completed");
    
                    if (filteredTasks.length === 0) {
                        return (
                            <div className="text-center py-12 border border-dashed border-[#E5E5E5] rounded-xl text-[#999999]">
                                <Coffee className="w-8 h-8 mx-auto text-[#999999] mb-3 opacity-60" />
                                <p className="text-sm font-medium">
                                    当前模块无待办行动
                                </p>
                                <p className="text-xs mt-1 text-[#999999]">
                                    输入你的目标，让 AI 为您分担压力。
                                </p>
                            </div>
                        );
                    }
    
                    return (
                        <div className="space-y-4">
                            {pendingAndStartedTasks.length === 0 && completedTasksList.length > 0 ? (
                                <div className="text-center py-12 bg-[#1F4D3A]/5 border border-dashed border-[#1F4D3A]/20 rounded-xl text-[#1F4D3A]">
                                    <Coffee className="w-8 h-8 mx-auto text-[#1F4D3A] mb-3 opacity-60" />
                                    <p className="text-sm font-semibold">
                                        🎉 恭喜！当前模块所有待办已全部完成
                                    </p>
                                    <p className="text-xs mt-1 text-[#666666]">
                                        前额叶已清空，尽情享受专注带来的平静吧。
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {pendingAndStartedTasks.map((task) => {
                                        const isStarted = task.status === "started";
                                        const isJustCompleted = justCompletedIds.includes(task.id);
                                        const tag = getCognitiveTag(
                                            task.priority,
                                            task.estimated_minutes,
                                        );
                                        const parentEntity = entities.find(
                                            (e) => e.id === task.entity_id,
                                        );
                                        const isP1 = task.priority === "P1";
                                        const isP3 = task.priority === "P3";
    
                                        if (editingTaskId === task.id) {
                                            return (
                                                <div key={task.id} className="p-4 rounded-xl border border-[#1F4D3A] bg-[#FAF9F6] shadow-sm space-y-3">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-[#666666] mb-1">任务名称</label>
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1F4D3A] bg-white text-[#111111]"
                                                            placeholder="输入动词开头的具体任务..."
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-[#666666] mb-1">完成判定标准</label>
                                                        <input
                                                            type="text"
                                                            value={editDoneCriteria}
                                                            onChange={(e) => setEditDoneCriteria(e.target.value)}
                                                            className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1F4D3A] bg-white text-[#111111]"
                                                            placeholder="例如：写完500字大纲"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-[#666666] mb-1">预计时间 (分钟)</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max="120"
                                                                value={editMinutes}
                                                                onChange={(e) => setEditMinutes(Math.max(1, Math.min(120, Number(e.target.value))))}
                                                                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1F4D3A] bg-white text-[#111111]"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-[#666666] mb-1">优先级</label>
                                                            <select
                                                                value={editPriority}
                                                                onChange={(e) => setEditPriority(e.target.value as "P1" | "P2" | "P3")}
                                                                className="w-full text-sm px-3 py-2 border border-[#E5E5E5] rounded-lg focus:outline-none focus:border-[#1F4D3A] bg-white text-[#111111]"
                                                            >
                                                                <option value="P1">P1 - 核心聚焦</option>
                                                                <option value="P2">P2 - 辅助行动</option>
                                                                <option value="P3">P3 - 轻量琐事</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end space-x-2 pt-1">
                                                        <button
                                                            onClick={() => setEditingTaskId(null)}
                                                            className="px-3 py-1.5 border border-[#E5E5E5] hover:bg-[#E5E5E5]/20 text-[#666666] text-xs font-medium rounded-lg transition-colors cursor-pointer bg-transparent"
                                                        >
                                                            取消
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveEdit(task.id)}
                                                            className="px-3 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] text-xs font-medium rounded-lg transition-colors cursor-pointer border-none"
                                                        >
                                                            保存修改
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
    
                                        return (
                                            <div
                                                key={task.id}
                                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all duration-150 ${
                                                    isJustCompleted
                                                        ? "animate-task-complete border-[#1F4D3A]/30 bg-[#1F4D3A]/5 shadow-sm"
                                                        : isStarted
                                                          ? "bg-[#1F4D3A]/5 border-[#1F4D3A]/30 shadow-sm ring-[0.5px] ring-[#1F4D3A]/20"
                                                          : "bg-[#FAF9F6] border-[#E5E5E5] hover:border-[#1F4D3A]/30"
                                                } ${isP1 ? "border-l-[4px] border-l-[#1F4D3A] pl-3" : ""}`}
                                            >
                                                <div className="flex items-center space-x-3 min-w-0">
                                                    {/* Checkbox selector */}
                                                    <button
                                                        onClick={() => {
                                                            handleCompleteTask(task.id);
                                                        }}
                                                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                                                            isJustCompleted
                                                                ? "animate-check-burst bg-[#1F4D3A] border-[#1F4D3A] text-[#FAF9F6]"
                                                                : isStarted
                                                                  ? "border-[#1F4D3A] text-[#1F4D3A] hover:bg-[#1F4D3A]/10"
                                                                  : "border-[#999999] hover:border-[#1F4D3A] text-transparent"
                                                        }`}
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
    
                                                    <div className="min-w-0">
                                                        <p className={`text-[15px] font-medium leading-normal ${isP3 ? "text-[#666666]" : "text-[#111111]"}`}>
                                                            {task.title}
                                                        </p>
                                                        {task.done_criteria && (
                                                            <p className="text-xs mt-1 text-[#666666] bg-[#FAF9F6]/80 border border-[#E5E5E5]/60 rounded-md px-2 py-0.5 max-w-fit shadow-2xs leading-relaxed">
                                                                <span className="text-[#1F4D3A] font-semibold">
                                                                    🎯 完成标准:{" "}
                                                                </span>
                                                                <span>{task.done_criteria}</span>
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#999999] font-medium">
                                                            <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${tag.style}`}>
                                                                {tag.label}
                                                            </span>
                                                            <span className="flex items-center space-x-1">
                                                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                                                <span>{task.estimated_minutes} 分钟</span>
                                                            </span>
                                                            {selectedEntityId === "today" && parentEntity && (
                                                                <span className="text-[10px] text-[#666666] bg-[#E5E5E5]/40 px-1.5 py-0.5 rounded">
                                                                    📂 {parentEntity.title}
                                                                </span>
                                                            )}
                                                            {isStarted && (
                                                                <span className="text-[#1F4D3A] flex items-center space-x-1 animate-pulse">
                                                                    <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                                                                    <span>进行中...</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
    
                                                {/* Hover action buttons */}
                                                <div className="flex items-center space-x-1 shrink-0 ml-4 opacity-40 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                    <button
                                                        onClick={() => handleMoveTaskUp(task.id)}
                                                        title="上移"
                                                        className="p-1 hover:bg-[#E5E5E5]/40 hover:text-[#111111] text-[#999999] rounded transition-colors cursor-pointer bg-transparent border-none"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleMoveTaskDown(task.id)}
                                                        title="下移"
                                                        className="p-1 hover:bg-[#E5E5E5]/40 hover:text-[#111111] text-[#999999] rounded transition-colors cursor-pointer bg-transparent border-none"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingTaskId(task.id);
                                                            setEditTitle(task.title);
                                                            setEditDoneCriteria(task.done_criteria || "");
                                                            setEditMinutes(task.estimated_minutes);
                                                            setEditPriority(task.priority);
                                                        }}
                                                        title="编辑"
                                                        className="p-1 hover:bg-[#E5E5E5]/40 hover:text-[#111111] text-[#999999] rounded transition-colors cursor-pointer bg-transparent border-none"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        title="删除"
                                                        className="p-1 hover:bg-red-50 hover:text-red-600 text-[#999999] rounded transition-colors cursor-pointer bg-transparent border-none"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
    
                                                    <div className="pl-1 border-l border-[#E5E5E5] ml-1">
                                                        {!isStarted ? (
                                                            <button
                                                                onClick={() => handleStartTask(task.id)}
                                                                className="px-2.5 py-1 bg-[#1F4D3A]/10 hover:bg-[#1F4D3A] text-[#1F4D3A] hover:text-[#FAF9F6] font-medium rounded-lg text-xs transition-colors duration-100 flex items-center space-x-1.5 cursor-pointer border-none"
                                                            >
                                                                <Play className="w-3 h-3 fill-current" />
                                                                <span>开始</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleCompleteTask(task.id)}
                                                                className="px-2.5 py-1 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-medium rounded-lg text-xs transition-colors duration-100 flex items-center space-x-1.5 cursor-pointer border-none"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                <span>完成</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
    
                            {/* Collapsible Completed Tasks Section */}
                            {completedTasksList.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-[#E5E5E5]/60">
                                    <button
                                        onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                                        className="flex items-center justify-between w-full text-xs font-semibold text-[#666666] hover:text-[#111111] transition-colors py-2 cursor-pointer bg-transparent border-none focus:outline-none"
                                    >
                                        <div className="flex items-center space-x-1.5">
                                            <span>已完成行动 ({completedTasksList.length})</span>
                                            {showCompletedTasks ? (
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            ) : (
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            )}
                                        </div>
                                        <span className="text-[10px] font-normal text-[#999999]">
                                            {showCompletedTasks ? "点击折叠" : "点击展开"}
                                        </span>
                                    </button>
    
                                    {showCompletedTasks && (
                                        <div className="space-y-2 mt-2 animate-fade-in">
                                            {completedTasksList.map((task) => {
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
                                                        className="group flex items-center justify-between p-4 rounded-xl border bg-[#E5E5E5]/10 border-[#E5E5E5]/40 opacity-30 transition-all duration-150"
                                                    >
                                                        <div className="flex items-center space-x-3 min-w-0">
                                                            <div className="w-5 h-5 rounded border border-[#1F4D3A] bg-[#1F4D3A] text-[#FAF9F6] flex items-center justify-center shrink-0">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </div>
    
                                                            <div className="min-w-0">
                                                                <p className="text-[15px] font-medium leading-normal line-through text-[#666666]">
                                                                    {task.title}
                                                                </p>
                                                                {task.done_criteria && (
                                                                    <p className="text-xs mt-1 text-[#999999] line-through">
                                                                        🎯 完成标准: {task.done_criteria}
                                                                    </p>
                                                                )}
                                                                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#999999] font-medium">
                                                                    <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase border ${tag.style}`}>
                                                                        {tag.label}
                                                                    </span>
                                                                    <span className="flex items-center space-x-1">
                                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                                        <span>{task.estimated_minutes} 分钟</span>
                                                                    </span>
                                                                    {selectedEntityId === "today" && parentEntity && (
                                                                        <span className="text-[10px] text-[#999999] bg-[#E5E5E5]/20 px-1.5 py-0.5 rounded">
                                                                            📂 {parentEntity.title}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
    
                                                        <div className="flex items-center space-x-1 shrink-0 ml-4 opacity-40 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                                            <button
                                                                onClick={() => handleDeleteTask(task.id)}
                                                                title="删除"
                                                                className="p-1 hover:bg-red-50 hover:text-red-600 text-[#999999] rounded transition-colors cursor-pointer bg-transparent border-none"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })()}
             </div>
         
                </>
            )}
        </>
    )}
    </section>

    {/* Daily Shutdown Ritual Modal Overlay */}
    {showShutdownModal && (
        <div className="fixed inset-0 bg-[#111111]/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#FAF9F6] border border-[#E5E5E5] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-[#E5E5E5] bg-gradient-to-r from-[#1F4D3A]/5 to-transparent flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-[#1F4D3A] flex items-center justify-center text-[#FAF9F6]">
                            <Clock className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#111111] text-base">
                            每日收盘仪式 (Daily Shutdown Ritual)
                        </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#1F4D3A] bg-[#1F4D3A]/10 px-2 py-0.5 rounded select-none">
                        步骤 {shutdownStep} / 4
                    </span>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {shutdownStep === 1 && (
                        /* Step 1: Review */
                        <div className="space-y-4 animate-fade-in text-center py-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto text-[#1F4D3A]">
                                <Check className="w-8 h-8 stroke-[3]" />
                            </div>
                            <h4 className="text-lg font-bold text-[#111111]">
                                今天的工作完成了！
                            </h4>
                            <p className="text-sm text-[#666666] leading-relaxed max-w-sm mx-auto">
                                回顾今天的进展。让我们把思绪从混乱转为秩序，清空今日工作记忆。
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4 max-w-xs mx-auto">
                                <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs">
                                    <span className="text-xs text-[#999999] font-medium block">已完成行动</span>
                                    <span className="text-3xl font-black text-[#1F4D3A] font-mono block mt-1">
                                        {tasks.filter(t => t.status === 'completed' && new Date(t.completed_at || '').toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA')).length}
                                    </span>
                                    <span className="text-[10px] text-[#999999] block mt-0.5">个任务</span>
                                </div>
                                <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-2xs">
                                    <span className="text-xs text-[#999999] font-medium block">累计专注时长</span>
                                    <span className="text-3xl font-black text-[#1F4D3A] font-mono block mt-1">
                                        {tasks
                                            .filter(t => t.status === 'completed' && new Date(t.completed_at || '').toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA'))
                                            .reduce((acc, t) => acc + t.estimated_minutes, 0)}
                                    </span>
                                    <span className="text-[10px] text-[#999999] block mt-0.5">分钟</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {shutdownStep === 2 && (
                        /* Step 2: Cleanup remaining tasks */
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-sm font-bold text-[#111111] flex items-center space-x-1.5">
                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                <span>处理今日未完成的行动 ({tasks.filter(t => t.status !== 'completed' && t.status !== 'backlog').length})</span>
                            </h4>
                            <p className="text-xs text-[#666666] leading-relaxed">
                                为了在下班后彻底放松，不要在大脑中遗留悬而未决的事情。请处理今天未完成的任务：
                            </p>
                            <div className="max-h-[30vh] overflow-y-auto space-y-2 pr-2">
                                {tasks.filter(t => t.status !== 'completed' && t.status !== 'backlog').length === 0 ? (
                                    <p className="text-xs text-green-700 font-semibold py-6 text-center select-none">
                                        ✨ 太棒了！今天没有残留任务！
                                    </p>
                                ) : (
                                    tasks
                                        .filter(t => t.status !== 'completed' && t.status !== 'backlog')
                                        .map(task => (
                                            <div key={task.id} className="py-2.5 border-b border-[#E5E5E5]/40 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                                <span className="text-sm font-medium text-[#333333] truncate max-w-[200px]">
                                                    {task.title}
                                                </span>
                                                <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                                                    <button
                                                        onClick={() => handleShutdownMoveToTomorrow(task.id)}
                                                        className="px-2.5 py-1 text-[10px] border border-[#E5E5E5] hover:bg-[#E5E5E5]/40 text-[#555555] rounded-md font-semibold cursor-pointer bg-white transition-colors"
                                                    >
                                                        延至明天
                                                    </button>
                                                    <button
                                                        onClick={() => handleShutdownMoveToBacklog(task.id)}
                                                        className="px-2.5 py-1 text-[10px] border border-amber-200 bg-amber-50/30 hover:bg-amber-50 text-amber-700 rounded-md font-semibold cursor-pointer transition-colors"
                                                    >
                                                        放待办池
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTask(task.id)}
                                                        className="px-2.5 py-1 text-[10px] border border-red-100 hover:bg-red-50 text-red-600 rounded-md font-semibold cursor-pointer transition-colors bg-white"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    )}

                    {shutdownStep === 3 && (
                        /* Step 3: Tomorrow’s focus setup */
                        <div className="space-y-4 animate-fade-in">
                            <h4 className="text-sm font-bold text-[#111111] flex items-center space-x-1.5">
                                <Sparkles className="w-4 h-4 text-[#1F4D3A]" />
                                <span>预热明天 (Tomorrow’s Focus)</span>
                            </h4>
                            <p className="text-xs text-[#666666] leading-relaxed">
                                在今天关机前，先确定明天清晨最重要、最想完成的一件事。这会让你明天睁开眼时心流清晰，毫无起步抗拒。
                            </p>
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-[#666666]">
                                    明天最重要的一件事 (最容易启动的 P1 微行动)
                                </label>
                                <input
                                    type="text"
                                    value={shutdownTomorrowFocus}
                                    onChange={(e) => setShutdownTomorrowFocus(e.target.value)}
                                    placeholder="例如：跑步20分钟，或者开始优化 pickNextAction 代码..."
                                    className="w-full text-sm px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl focus:outline-none focus:border-[#1F4D3A] bg-white text-[#111111]"
                                />
                                <span className="text-[10px] text-[#999999] block select-none">
                                    注：这会自动在明天的今日工作区中，生成一个 P1 优先级的聚焦任务。可跳过。
                                </span>
                            </div>
                        </div>
                    )}

                    {shutdownStep === 4 && (
                        /* Step 4: Closing quotes */
                        <div className="space-y-4 animate-fade-in text-center py-6">
                            <div className="text-5xl select-none">☕</div>
                            <h4 className="text-lg font-black text-[#1F4D3A] tracking-wide uppercase select-none">
                                "Shutdown Complete"
                            </h4>
                            <p className="text-sm text-[#333333] font-medium leading-relaxed italic max-w-sm mx-auto">
                                「今日工作已全部完成。现在，合上电脑，去生活，去享受你的夜晚。」
                            </p>
                            <p className="text-xs text-[#999999]">
                                祝你度过一个轻松、无负担的傍晚。明天见 🌅
                            </p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-[#E5E5E5] bg-white flex justify-between items-center shrink-0">
                    <button
                        onClick={() => {
                            if (shutdownStep === 1) {
                                setShowShutdownModal(false);
                            } else {
                                setShutdownStep(prev => prev - 1);
                            }
                        }}
                        className="px-4 py-2 border border-[#E5E5E5] hover:bg-[#E5E5E5]/20 text-[#666666] text-xs font-semibold rounded-xl transition-colors cursor-pointer bg-transparent"
                    >
                        {shutdownStep === 1 ? "取消收盘" : "上一步"}
                    </button>

                    <button
                        onClick={() => {
                            if (shutdownStep === 4) {
                                handleShutdownComplete();
                            } else {
                                setShutdownStep(prev => prev + 1);
                            }
                        }}
                        className="px-5 py-2 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer border-none"
                    >
                        {shutdownStep === 3 ? "确定并生成聚焦" : shutdownStep === 4 ? "完成仪式" : "下一步"}
                    </button>
                </div>
            </div>
        </div>
    )}
     </main>

  );
}
