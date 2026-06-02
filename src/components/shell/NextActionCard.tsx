'use client';

import { Check, Clock, Play } from 'lucide-react';
import type { Task } from '@/lib/db/types';

interface NextActionCardProps {
  task: Task;
  variant: 'focus' | 'standard';
  onStart: (taskId: string) => void;
  onComplete: (taskId: string) => void;
}

export default function NextActionCard({
  task,
  variant,
  onStart,
  onComplete,
}: NextActionCardProps) {
  const isFocus = variant === 'focus';
  const isStarted = task.status === 'started';

  const shellClass = isFocus
    ? 'bg-[#FAF9F6] border-2 border-[#1F4D3A] rounded-2xl p-10 shadow-xl relative overflow-hidden space-y-6 w-full max-w-2xl border-solid bg-gradient-to-br from-[#FAF9F6] to-[#1F4D3A]/2 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-2xl'
    : 'sticky top-0 z-20 bg-[#FAF9F6] border-2 border-[#1F4D3A] rounded-xl p-6 shadow-md mb-6';

  const badgeClass = isFocus
    ? 'text-[10px] font-black tracking-widest text-[#FAF9F6] bg-[#1F4D3A] px-3.5 py-1.5 rounded-lg uppercase animate-pulse select-none font-mono'
    : 'text-[9px] font-bold tracking-widest text-[#FAF9F6] bg-[#1F4D3A] px-2.5 py-1 rounded uppercase animate-pulse';

  return (
    <div className={shellClass}>
      <div className={`absolute top-0 right-0 ${isFocus ? 'p-6' : 'p-4'}`}>
        <span className={badgeClass}>
          {isFocus ? 'NEXT ACTION · 核心一步' : 'NEXT ACTION · 核心下一步'}
        </span>
      </div>

      <div className={isFocus ? 'space-y-4' : 'space-y-2'}>
        <div
          className={`flex items-center space-x-2 text-xs ${isFocus ? 'text-[#1F4D3A] font-bold bg-[#1F4D3A]/10 px-3 py-1 rounded w-fit' : 'text-[#666666] font-medium'}`}
        >
          <Clock className={`${isFocus ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[#1F4D3A] shrink-0`} />
          <span>
            {isFocus ? '建议时长' : '预计启动与专注耗时'}：{task.estimated_minutes} 分钟
          </span>
        </div>

        {isFocus ? (
          <h2 className="text-2xl font-black text-[#111111] leading-snug tracking-tight">
            {task.title}
          </h2>
        ) : (
          <h4 className="text-lg font-extrabold text-[#111111] leading-snug tracking-tight">
            {task.title}
          </h4>
        )}

        {task.done_criteria && (
          <div
            className={
              isFocus
                ? 'flex items-start space-x-2.5 text-xs text-[#245C47] bg-[#1F4D3A]/5 border-l-4 border-[#1F4D3A] p-4 rounded-r leading-relaxed'
                : 'text-xs text-[#333333] bg-[#E5E5E5]/30 rounded-lg p-3 border-l-4 border-[#1F4D3A] leading-relaxed mt-2'
            }
          >
            {isFocus ? (
              <>
                <span className="font-bold shrink-0">🎯 完成标准:</span>
                <span>{task.done_criteria}</span>
              </>
            ) : (
              <>🎯 完成标准: {task.done_criteria}</>
            )}
          </div>
        )}
      </div>

      {isFocus && (
        <div className="text-xs text-[#555555] bg-[#E5E5E5]/40 rounded-xl p-4 border border-[#E5E5E5]/60 leading-relaxed font-semibold">
          💡 只做这一件，专注当下一小步。
        </div>
      )}

      <div className={`flex items-center flex-wrap gap-3 ${isFocus ? 'space-x-4 pt-2' : 'mt-4'}`}>
        {!isStarted ? (
          <button
            type="button"
            onClick={() => onStart(task.id)}
            className={
              isFocus
                ? 'px-8 py-4 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-bold rounded-xl text-xs transition-all duration-150 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer border-none'
                : 'px-6 py-2.5 bg-[#1F4D3A] hover:bg-[#245C47] text-[#FAF9F6] font-semibold rounded-lg text-xs transition-all duration-150 flex items-center justify-center space-x-2 shadow active:scale-[0.98] cursor-pointer border-none'
            }
          >
            <Play className={`${isFocus ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill-current shrink-0`} />
            <span>{isFocus ? '开始 (Start)' : '开始 (Start)'}</span>
          </button>
        ) : (
          <>
            <span
              className={`inline-flex items-center space-x-2 text-[#1F4D3A] font-semibold ${isFocus ? 'text-sm' : 'text-xs'}`}
            >
              <Play className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>进行中 — 保持专注</span>
            </span>
            <button
              type="button"
              onClick={() => onComplete(task.id)}
              className={`text-xs text-[#666666] hover:text-[#1F4D3A] underline-offset-2 hover:underline bg-transparent border-none cursor-pointer px-1 py-1 ${isFocus ? '' : ''}`}
            >
              标记完成
            </button>
          </>
        )}
        {isFocus && isStarted && (
          <button
            type="button"
            onClick={() => onComplete(task.id)}
            className="px-4 py-2 border border-[#E5E5E5] text-[#666666] hover:bg-[#E5E5E5]/30 rounded-lg text-xs cursor-pointer bg-white"
          >
            <Check className="w-3.5 h-3.5 inline mr-1" />
            完成
          </button>
        )}
      </div>

    </div>
  );
}
