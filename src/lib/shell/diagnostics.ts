import type { Entity, Routine, Task } from '@/lib/db/types';
import { pickNextAction } from './taskUi';

export interface CoachDiagnostic {
  title: string;
  badge: string;
  badgeColorClass: string;
  desc: string;
  growText: string;
  actionType?: 'startTask' | 'addTask' | 'startHabit';
  taskId?: string;
  projectId?: string;
  habitId?: string;
  taskTitle?: string;
  estimatedMinutes?: number;
  priority?: 'P1' | 'P2' | 'P3';
  doneCriteria?: string;
  btnText?: string;
}

export function buildProjectDiagnostic(entities: Entity[], tasks: Task[]): CoachDiagnostic {
  const activeProjects = entities.filter((e) => e.type === 'project' && e.status !== 'archived');

  if (activeProjects.length === 0) {
    return {
      title: '📂 项目行动契机 (Opportunity)',
      badge: '项目初始化',
      badgeColorClass: 'bg-[#1F4D3A]/10 text-[#1F4D3A]',
      desc: '目前尚未建立任何项目。大脑适合思考，而不适合储存零散的认知负担。',
      growText:
        '💡 试试看 (GROW Options)：直接在顶部输入你想完成的事情（例：“本周家庭聚餐规划”、“完善 ActionOS 系统结构”），由 AI 帮你快速解构并创建首个结构化项目，完全释放大脑工作带宽。',
    };
  }

  const projectWithPendingTasks = activeProjects
    .map((p) => ({
      project: p,
      pending: tasks.filter((t) => t.entity_id === p.id && t.status !== 'completed'),
    }))
    .find((item) => item.pending.length > 0);

  if (projectWithPendingTasks) {
    const { project, pending } = projectWithPendingTasks;
    const firstTask = pickNextAction(pending)!;
    return {
      title: '📂 项目行动契机 (Opportunity)',
      badge: '行动唤醒',
      badgeColorClass: 'bg-amber-50 text-amber-700',
      desc: `检测到项目【${project.title}】仍有 ${pending.length} 个未完成行动。当感到项目停滞不前时，往往是因为下一步行动过于庞杂。`,
      growText: `💡 试试看 (GROW Options)：只需先开启最核心的原子任务 “${firstTask.title}”，预计只需 ${firstTask.estimated_minutes} 分钟即可突破起跑阻抗，重新拉动项目动量！`,
      actionType: 'startTask',
      taskId: firstTask.id,
      projectId: project.id,
      btnText: `开始任务: ${firstTask.title}`,
    };
  }

  const firstProject = activeProjects[0];
  return {
    title: '📂 项目行动契机 (Opportunity)',
    badge: '燃料填充',
    badgeColorClass: 'bg-amber-50 text-amber-700',
    desc: `检测到项目【${firstProject.title}】当前没有待办行动。没有燃料的项目很容易在无意识中停滞。`,
    growText:
      '💡 试试看 (GROW Options)：尝试为该项目新增一个预计少于 30 分钟的下一步具体行动，例如“梳理最新进展”或“设计测试用例”，重新点燃项目生命力。',
    actionType: 'addTask',
    projectId: firstProject.id,
    taskTitle: '梳理下一步具体行动',
    estimatedMinutes: 15,
    priority: 'P1',
    doneCriteria: '明确并记录该项目的下一个具体交付物',
    btnText: '添加下一步行动',
  };
}

export function buildAttentionDiagnostic(routines: Routine[]): CoachDiagnostic {
  if (routines.length === 0) {
    return {
      title: '🧠 注意残留觉察 (Attention Residue)',
      badge: '认知流控',
      badgeColorClass: 'bg-[#1F4D3A]/10 text-[#1F4D3A]',
      desc: '频繁在不同待办或想法之间横向切换，会在大脑的工作记忆中留下注意残留，无形累积深度疲劳。',
      growText:
        '💡 试试看 (GROW Options)：点击“⚡ 日常习惯”旁边的“+ 新建”，录入首个呼吸正念或轻量拉伸习惯，绑定日常事件锚点（如“起床后”、“餐后”），构建认知的韧性防线。',
    };
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  const pendingRoutine = routines.find((r) => {
    const lastCompStr = r.last_completed_at
      ? new Date(r.last_completed_at).toLocaleDateString('en-CA')
      : '';
    return lastCompStr !== todayStr;
  });

  if (pendingRoutine) {
    return {
      title: '🧠 注意残留觉察 (Attention Residue)',
      badge: '脑力保护',
      badgeColorClass: 'bg-[#1F4D3A]/10 text-[#1F4D3A]',
      desc: '您目前正在多任务间横向切换，工作记忆中的注意残留碎片正在侵蚀你的专注带宽。',
      growText: `💡 试试看 (GROW Options)：现在是唤醒今日习惯 “${pendingRoutine.title}” (${pendingRoutine.anchor_time}) 的极佳行动契机。只需大约 ${pendingRoutine.estimated_minutes} 分钟即可迅速清空大脑缓存，重获单线程专注状态。`,
      actionType: 'startHabit',
      habitId: pendingRoutine.id,
      btnText: `执行习惯: ${pendingRoutine.title}`,
    };
  }

  const firstRoutine = routines[0];
  return {
    title: '🧠 注意残留觉察 (Attention Residue)',
    badge: '高效状态',
    badgeColorClass: 'bg-[#1F4D3A]/10 text-[#1F4D3A]',
    desc: `今日已圆满完成习惯 “${firstRoutine.title}”。目前大脑前额叶皮层处于健康的单线程低损耗工作状态。`,
    growText:
      '💡 试试看 (GROW Options)：在交付当前高优先级待办任务后，建议进行 3-5 分钟的短暂闭目静心，深度固化当前认知动量。',
    actionType: 'addTask',
    projectId: 'today',
    taskTitle: '短暂闭目静心',
    estimatedMinutes: 5,
    priority: 'P3',
    doneCriteria: '闭眼深呼吸，排除杂念5分钟',
    btnText: '开始闭目静心',
  };
}
