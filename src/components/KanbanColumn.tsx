import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";
import type { Task } from "@/hooks/useTasks";
import { Circle, Clock } from "lucide-react";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onDelete: (id: string) => void;
}

const columnConfig: Record<string, { icon: any; gradient: string }> = {
  todo: { icon: Circle, gradient: "from-info to-info/70" },
  in_progress: { icon: Clock, gradient: "from-warning to-warning/70" },
};

const KanbanColumn = ({ id, title, tasks, onDelete }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const config = columnConfig[id] || columnConfig.todo;
  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[320px] max-w-[480px] rounded-2xl p-1 transition-all duration-200 ${
        isOver ? "bg-accent/50 ring-2 ring-primary/20" : ""
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        <span className="ml-auto text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-1">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 px-1 pb-2 min-h-[120px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-24 rounded-xl border-2 border-dashed border-border/50 text-muted-foreground/40 text-sm">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
