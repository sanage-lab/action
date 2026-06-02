import { z } from 'zod';
import type { DecomposeContext } from './decomposeContext';

export const DecomposedTaskSchema = z.object({
  title: z.string().describe("原子微行动名称。必须以动词开头 (如：检查、配置、撰写、购买)，且必须是可立即执行的具体动作"),
  estimated_minutes: z.number().int().min(1).max(120).describe("预计专注分钟数，必须在 1 到 120 分钟之间。如果行动过大，必须拆解为更小的独立动作"),
  priority: z.enum(['P1', 'P2', 'P3']).describe("任务启动能量级别。P1 对应 ⚡ 极易启动, P2 对应 ⚡ 中等启动, P3 对应 ⚡ 深度专注"),
  done_criteria: z.string().describe("明确具体的完成判断标准 (如：'首页的 <title> 标签成功渲染且无拼写错误')"),
  suggested_start_time: z.string().optional().describe("对于时间敏感型任务，推荐的开始时间（如 '14:30'），非时间敏感任务可为空")
});

export const DecomposeSchema = z.object({
  entity_title: z.string().describe("该事项推荐被归类或新创建的项目、目标或习惯 of the title (如：Brain Sanage, 恢复运动状态等)"),
  entity_type: z.enum(['project', 'goal', 'habit', 'asset']).describe("该事项推荐的分类类型"),
  today_focus: z.string().describe("针对该项任务，今天最值得完成聚焦的具体大焦点名称 (e.g. '首页 SEO 优化')"),
  why_focus: z.string().describe("从行为激活或长期价值角度，回答为什么今天做这件事最重要，解释价值 (Answering '为什么做')"),
  tasks: z.array(DecomposedTaskSchema).max(5).describe("拆解出的原子步骤列表，最多 5 条"),
  backlog_tasks: z.array(DecomposedTaskSchema).optional().describe("由于今日待办任务过多，暂时存入待办池（Backlog）的低优先级或次要任务"),
  load_message: z.string().optional().describe("针对今日待办任务过多时，系统给出的说明或反馈文案（如：今日已有 N 个待办，其余已存入待办池）")
});

export type DecomposeResponse = z.infer<typeof DecomposeSchema>;

export interface AIProvider {
  name: string;
  decompose(inputText: string, context?: DecomposeContext): Promise<DecomposeResponse>;
}

