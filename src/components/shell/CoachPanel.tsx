'use client';

import { AlertCircle, Brain, Sparkles, TrendingUp } from 'lucide-react';
import type { ActionShell } from '@/components/shell/useActionShell';

interface CoachPanelProps {
  shell: ActionShell;
}

export default function CoachPanel({ shell }: CoachPanelProps) {
  const {
    isRightPanelOpen,
    momentumStatus,
    maxHabitStreak,
    avgStartMinutes,
    completedTasks,
    projectDiagnostic,
    attentionDiagnostic,
    handleAdoptCoachSuggestion,
    completedTrend,
    avgStartTrend,
    streakTrend,
  } = shell;

  if (!isRightPanelOpen) return null;
  return (
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
                                <span className="text-[7.5px] text-[#999999] mt-1 select-none font-medium leading-none">
                                    {streakTrend?.label || '稳定保护'}
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
                                <span className={`text-[7.5px] mt-1 select-none font-bold leading-none ${completedTrend && completedTrend.diff >= 0 ? 'text-[#1F4D3A]' : 'text-red-600'}`}>
                                    {completedTrend?.label || '比上周多 0'}
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
                                <span className={`text-[7.5px] mt-1 select-none font-bold leading-none ${avgStartTrend && avgStartTrend.diff <= 0 ? 'text-[#1F4D3A]' : 'text-red-600'}`}>
                                    {avgStartTrend?.label || '与上周持平'}
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
                            {projectDiagnostic.btnText && (
                                <button
                                    onClick={() => handleAdoptCoachSuggestion(projectDiagnostic)}
                                    className="mt-2.5 w-full flex items-center justify-center space-x-1 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] text-[11px] font-medium rounded-lg transition-colors duration-100 cursor-pointer shadow-xs border-none"
                                >
                                    <span>⚡ {projectDiagnostic.btnText}</span>
                                </button>
                            )}
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
                            {attentionDiagnostic.btnText && (
                                <button
                                    onClick={() => handleAdoptCoachSuggestion(attentionDiagnostic)}
                                    className="mt-2.5 w-full flex items-center justify-center space-x-1 py-1.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] text-[11px] font-medium rounded-lg transition-colors duration-100 cursor-pointer shadow-xs border-none"
                                >
                                    <span>⚡ {attentionDiagnostic.btnText}</span>
                                </button>
                            )}
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
  );
}
