import { z } from 'zod';

export const DecomposedTaskSchema = z.object({
  title: z.string().describe("原子微行动名称。必须以动词开头 (如：检查、配置、撰写、购买)，且必须是可立即执行的具体动作"),
  estimated_minutes: z.number().int().min(5).max(30).describe("预计专注分钟数，必须在 5 到 30 分钟之间。如果行动过大，必须拆解为更小的独立动作"),
  priority: z.enum(['P1', 'P2', 'P3']).describe("任务启动能量级别。P1 对应 ⚡ 极易启动, P2 对应 ⚡ 中等启动, P3 对应 ⚡ 深度专注"),
  done_criteria: z.string().describe("明确具体的完成判断标准 (如：'首页的 <title> 标签成功渲染且无拼写错误')")
});

export const DecomposeSchema = z.object({
  entity_title: z.string().describe("该事项推荐被归类或新创建的项目、目标或习惯的标题名称 (如：Brain Sanage, 恢复运动状态等)"),
  entity_type: z.enum(['project', 'goal', 'habit', 'asset']).describe("该事项推荐的分类类型"),
  today_focus: z.string().describe("针对该项任务，今天最值得完成聚焦的具体大焦点名称 (e.g. '首页 SEO 优化')"),
  why_focus: z.string().describe("从行为激活或长期价值角度，回答为什么今天做这件事最重要，解释价值 (Answering '为什么做')"),
  tasks: z.array(DecomposedTaskSchema).describe("拆解出的原子步骤列表")
});

export type DecomposeResponse = z.infer<typeof DecomposeSchema>;

export interface AIProvider {
  name: string;
  decompose(inputText: string): Promise<DecomposeResponse>;
}
