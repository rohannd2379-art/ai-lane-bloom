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

const columnConfig: Record<string, { icon: any; gradient: string; accentBg: string; dotColor: string; borderAccent: string; bgTint: string }> = {
  todo: {
    icon: Circle,
    gradient: "from-yellow-400 to-amber-300",
    accentBg: "bg-yellow-50 dark:bg-yellow-950/30",
    dotColor: "bg-yellow-400",
    borderAccent: "border-yellow-300/50 dark:border-yellow-500/20",
    bgTint: "bg-gradient-to-b from-yellow-50/60 to-transparent dark:from-yellow-950/10 dark:to-transparent",
  },
  in_progress: {
    icon: Clock,
    gradient: "from-orange-400 to-red-400",
    accentBg: "bg-orange-50 dark:bg-orange-950/30",
    dotColor: "bg-orange-400",
    borderAccent: "border-orange-300/50 dark:border-orange-500/20",
    bgTint: "bg-gradient-to-b from-orange-50/60 to-transparent dark:from-orange-950/10 dark:to-transparent",
  },
  complete: {
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-teal-400",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/30",
    dotColor: "bg-emerald-400",
    borderAccent: "border-emerald-300/50 dark:border-emerald-500/20",
    bgTint: "bg-gradient-to-b from-emerald-50/60 to-transparent dark:from-emerald-950/10 dark:to-transparent",
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
