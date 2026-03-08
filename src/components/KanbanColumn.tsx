import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import type { Task } from "@/hooks/useTasks";
import { Circle, Clock, CheckCircle2 } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
  onEdit: (id: string, updates: { title: string; description: string; category: string; due_date: string | null }) => void;
}

const columnConfig: Record<string, { icon: any; gradient: string; accentBg: string; dotColor: string }> = {
  todo: {
    icon: Circle,
    gradient: "from-info to-blue-400",
    accentBg: "bg-blue-50 dark:bg-blue-950/30",
    dotColor: "bg-info",
  },
  in_progress: {
    icon: Clock,
    gradient: "from-amber-400 to-orange-400",
    accentBg: "bg-amber-50 dark:bg-amber-950/30",
    dotColor: "bg-warning",
  },
  complete: {
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-green-500",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    dotColor: "bg-success",
  },
};

const KanbanColumn = ({ id, title, tasks, onDelete, onEdit }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = columnConfig[id] || columnConfig.todo;
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[300px] max-w-[420px] rounded-2xl transition-all duration-300 ${
        isOver
          ? "ring-2 ring-primary/30 bg-primary/5 scale-[1.01]"
          : ""
      }`}
    >
      {/* Column header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="font-display font-bold text-foreground text-[15px]">{title}</h3>
        </div>
        <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${config.accentBg} text-foreground/70`}>
          {tasks.length}
        </span>
      </div>

      {/* Column body */}
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 px-2 pb-3 min-h-[140px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} onEdit={onEdit} columnId={id} />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-28 rounded-xl border-2 border-dashed border-border/40 text-muted-foreground/40 text-sm gap-1">
              <Icon className="w-5 h-5 opacity-40" />
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
