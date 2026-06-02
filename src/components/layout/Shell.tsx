"use client";

import LeftPanel from "@/components/shell/LeftPanel";
import WorkspacePanel from "@/components/shell/WorkspacePanel";
import CoachPanel from "@/components/shell/CoachPanel";
import HabitWizardModal from "@/components/shell/HabitWizardModal";
import { useActionShell, type ShellInitialData } from "@/components/shell/useActionShell";
import { Check } from "lucide-react";
import type { Entity, Task, Routine, HistoryLog, Draft } from "@/lib/db";

interface ShellProps {
    initialEntities: Entity[];
    initialTasks: Task[];
    initialRoutines: Routine[];
    initialHistoryLogs: HistoryLog[];
    initialDrafts: Draft[];
}

export default function Shell({
    initialEntities,
    initialTasks,
    initialRoutines,
    initialHistoryLogs,
    initialDrafts,
}: ShellProps) {
    const shell = useActionShell({
        initialEntities,
        initialTasks,
        initialRoutines,
        initialHistoryLogs,
        initialDrafts,
    } satisfies ShellInitialData);


    const { completionAlert } = shell;

    return (
        <div className="flex-1 flex overflow-hidden h-screen bg-[#FAF9F6]">
            <LeftPanel shell={shell} />
            <WorkspacePanel shell={shell} />
            <CoachPanel shell={shell} />
            <HabitWizardModal shell={shell} />

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
