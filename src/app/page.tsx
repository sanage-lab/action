import { LocalDatabase } from "@/lib/db";
import Shell from "@/components/layout/Shell";

export const dynamic = "force-dynamic";

export default function Home() {
  // Cleanse active Today view of old tasks on load
  LocalDatabase.autoMoveOldTasksToBacklog();

  // Fetch initial data from local JSON database on server side
  const entities = LocalDatabase.getEntities();
  const tasks = LocalDatabase.getTasks();
  const routines = LocalDatabase.getRoutines();
  const historyLogs = LocalDatabase.getHistoryLogs();
  const drafts = LocalDatabase.getDrafts();

  return (
    <Shell
      initialEntities={entities}
      initialTasks={tasks}
      initialRoutines={routines}
      initialHistoryLogs={historyLogs}
      initialDrafts={drafts}
    />
  );
}

