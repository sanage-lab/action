'use client';

import type { ActionShell } from '@/components/shell/useActionShell';

interface HabitWizardModalProps {
  shell: ActionShell;
}

export default function HabitWizardModal({ shell }: HabitWizardModalProps) {
  const {
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
    entities,
    handleSaveHabit,
  } = shell;

  if (!isAddingHabit) return null;

  return (
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
  );
}
