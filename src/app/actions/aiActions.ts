'use server';

import { AIFactory } from '@/lib/ai/factory';
import { LocalDatabase } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function decomposeAction(inputText: string) {
  try {
    const text = inputText.trim();
    if (!text) {
      return { success: false, error: "Input text cannot be empty." };
    }

    // 1. Getswappable AI provider from factory dispatcher
    const provider = AIFactory.getProvider();
    console.log(`[ActionOS Server] Invoking AI provider: ${provider.name}`);

    // 2. Perform cognitive task decomposition
    const data = await provider.decompose(text);

    // 3. Persistent Database Operations
    const entities = LocalDatabase.getEntities();
    
    // Check if entity with same title exists, else create it
    let entityId = '';
    const existing = entities.find(e => 
      e.title.toLowerCase().trim() === data.entity_title.toLowerCase().trim()
    );

    if (existing) {
      entityId = existing.id;
    } else {
      entityId = `ent-${Date.now()}`;
      LocalDatabase.addEntity({
        id: entityId,
        type: data.entity_type,
        title: data.entity_title,
        description: `由 AI (${provider.name}) 智能捕获于: "${text.slice(0, 20)}..."`,
        today_focus: data.today_focus,
        why_focus: data.why_focus
      });
    }

    // Insert atomic tasks bilingually
    for (const task of data.tasks) {
      LocalDatabase.addTask({
        id: `t-ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        entity_id: entityId,
        title: task.title,
        estimated_minutes: task.estimated_minutes,
        priority: task.priority,
        done_criteria: task.done_criteria
      });
    }

    // Insert history log
    LocalDatabase.addHistoryLog({
      id: `log-ai-${Date.now()}`,
      input_text: text,
      ai_response: `AI已成功将其捕获并精准分发至【${data.entity_title}】，共创建 ${data.tasks.length} 个下一步行动。`
    });

    // 4. Force Next.js Router path revalidation
    revalidatePath('/');

    return { 
      success: true, 
      providerName: provider.name,
      entityTitle: data.entity_title 
    };

  } catch (error: any) {
    console.error("[ActionOS Server Action] Decompose failed:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred during task decomposition." 
    };
  }
}
