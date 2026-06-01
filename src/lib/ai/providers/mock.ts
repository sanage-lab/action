import { DecomposeResponse, AIProvider } from '../types';

export class MockProvider implements AIProvider {
  public name = 'mock';

  public async decompose(inputText: string): Promise<DecomposeResponse> {
    // Simulate minor network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const text = inputText.trim();
    let detectedEntityTitle = "全新行动计划";
    let type: 'project' | 'goal' | 'habit' | 'asset' = 'project';
    let todayFocus = "迈出今日第一步";
    let whyFocus = "从小步骤启动，彻底打破拖延僵局，重建掌控感";
    let tasks: DecomposeResponse['tasks'] = [];

    if (text.includes('SEO') || text.includes('seo') || text.includes('国际化')) {
      detectedEntityTitle = "SEO 与全球化推广";
      type = 'project';
      todayFocus = "Brain Sanage 首页 SEO 优化";
      whyFocus = "打通全球多语言索引抓取链路，开启被动流量增长";
      tasks = [
        { title: '检查网站在 Google Console 里的索引情况', estimated_minutes: 15, priority: 'P1', done_criteria: '完成 Search Console 仪表盘最近 30 天爬取状态截图校验' },
        { title: '配置多语言路由和 HTML Lang 标签', estimated_minutes: 20, priority: 'P2', done_criteria: '页面源代码中包含 lang="zh" 或 lang="en" 属性' },
        { title: '撰写 3 个核心页面的 Meta Description', estimated_minutes: 15, priority: 'P1', done_criteria: '首页及关于页的 description 字段包含目标关键词且在 150 字内' },
        { title: '到菜市场采购整只土鸡和晚餐食材', estimated_minutes: 30, priority: 'P3', done_criteria: '购买齐备鸡肉、煎蛋用蛋与青菜等晚餐主要原料' }
      ];
    } else if (text.includes('健身') || text.includes('运动') || text.includes('跑')) {
      detectedEntityTitle = "恢复运动状态";
      type = 'goal';
      todayFocus = "今日心肺有氧激活慢跑";
      whyFocus = "通过轻量运动促进多巴胺分泌，活跃脑细胞以消解长期紧绷";
      tasks = [
        { title: '更换舒适运动服并穿戴跑鞋', estimated_minutes: 5, priority: 'P1', done_criteria: '整装待发，防风外套与减震跑鞋穿戴完毕' },
        { title: '完成 3 公里心率有氧慢跑', estimated_minutes: 25, priority: 'P2', done_criteria: '跑步软件或运动手表记录运动轨迹达到 3 公里' },
        { title: '跑后大腿肌群拉伸与深呼吸', estimated_minutes: 10, priority: 'P1', done_criteria: '完成膝盖、大腿前侧与小腿肌群的正念拉伸' }
      ];
    } else if (text.includes('冥想') || text.includes('呼吸') || text.includes('静坐')) {
      detectedEntityTitle = "冥想";
      type = 'habit';
      todayFocus = "清晨正念呼吸觉察";
      whyFocus = "抑制大脑前额叶过度活跃，理清复杂任务杂乱残留";
      tasks = [
        { title: '寻找舒适静止坐姿并闭眼', estimated_minutes: 2, priority: 'P1', done_criteria: '在平稳的坐垫或椅子上端坐并闭合双眼' },
        { title: '开启 10 分钟腹式呼吸与静坐觉察', estimated_minutes: 10, priority: 'P1', done_criteria: '腹式呼吸不间断达到 10 分钟' },
        { title: '轻微活动双肩完成今日正念打卡', estimated_minutes: 3, priority: 'P2', done_criteria: '觉察打卡记录同步到习惯追踪版块' }
      ];
    } else {
      // Default dynamic mock based on text length
      detectedEntityTitle = text.slice(0, 15) + (text.length > 15 ? '...' : '');
      type = 'project';
      todayFocus = `执行关于【${detectedEntityTitle}】的核心事项`;
      whyFocus = "拆卸认知重担，建立积极的反馈微循环";
      tasks = [
        { title: '整理该事项的前期背景资料', estimated_minutes: 10, priority: 'P1', done_criteria: '在记事本中整理出 3 条以上该事项的关键现状背景' },
        { title: '在纸上勾勒出事件 of 3 个核心推进点', estimated_minutes: 15, priority: 'P2', done_criteria: '手写或白板绘制出项目推进的第一、二、三步' },
        { title: '完成当前最容易启动的下一步微动作', estimated_minutes: 15, priority: 'P1', done_criteria: '第一个小于 15 分钟的微任务显示完成状态' }
      ];
    }

    return {
      entity_title: detectedEntityTitle,
      entity_type: type,
      today_focus: todayFocus,
      why_focus: whyFocus,
      tasks
    };
  }
}
