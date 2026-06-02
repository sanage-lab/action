'use client';

import { Brain, Sun, Compass, Target, RefreshCw, BookOpen, Check, CheckCircle2, Inbox } from 'lucide-react';
import NextActionCard from '@/components/shell/NextActionCard';
import { getCognitiveTag } from '@/lib/shell/taskUi';
import type { ActionShell } from '@/components/shell/useActionShell';

interface LeftPanelProps {
  shell: ActionShell;
}

export default function LeftPanel({ shell }: LeftPanelProps) {
  const {
    entities,
    tasks,
    selectedEntityId,
    setSelectedEntityId,
    recentWins,
    setIsAddingHabit,
    setOnboardingStep,
    setNewHabitName,
    setNewHabitPhrase,
    drafts,
  } = shell;
  return (
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
                                                "completed" &&
                                                t.status !==
                                                "backlog",
                                        ).length
                                    }
                                </span>
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() =>
                                    setSelectedEntityId("inbox")
                                }
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                                    selectedEntityId === "inbox"
                                        ? "bg-[#1F4D3A] text-[#FAF9F6] font-semibold shadow-sm"
                                        : "text-[#333333] hover:bg-[#E5E5E5]/40 hover:text-[#111111] font-medium"
                                }`}
                            >
                                <div className="flex items-center space-x-2">
                                    <Inbox className="w-4.5 h-4.5 shrink-0" />
                                    <span>📥 收集箱 (Inbox)</span>
                                </div>
                                {drafts.length > 0 && (
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                            selectedEntityId === "inbox"
                                                ? "bg-[#245C47] text-[#FAF9F6]"
                                                : "bg-[#A32D2D]/15 text-[#A32D2D]"
                                        }`}
                                    >
                                        {drafts.length}
                                    </span>
                                )}
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
                            .filter((e) => e.type === "project" && e.status !== "archived")
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
                            .filter((e) => e.type === "goal" && e.status !== "archived")
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
                            .filter((e) => e.type === "habit" && e.status !== "archived")
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
                            .filter((e) => e.type === "asset" && e.status !== "archived")
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
    
  );
}
