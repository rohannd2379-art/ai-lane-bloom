import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Tag, CheckCircle2 } from "lucide-react";
import type { Task } from "@/hooks/useTasks";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  columnId?: string;
}

const categoryColors: Record<string, string> = {
  design: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  dev: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  research: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  bug: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  feature: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function getCategoryColor(category: string) {
  const lower = category.toLowerCase();
  for (const key in categoryColors) {
    if (lower.includes(key)) return categoryColors[key];
  }
  return "bg-accent text-accent-foreground";
}

const TaskCard = ({ task, onDelete, columnId }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isComplete = columnId === "complete" || task.status === "complete";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card rounded-xl p-4 border border-border/40 hover:border-primary/20 transition-all duration-200 overflow-hidden ${
        isDragging ? "opacity-50 scale-105 rotate-1 z-50 shadow-elevated" : "shadow-card hover:shadow-elevated"
      } ${isComplete ? "opacity-80" : ""}`}
    >
      {/* Subtle left accent bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
          isComplete
            ? "bg-gradient-to-b from-emerald-400 to-green-500"
            : columnId === "in_progress"
            ? "bg-gradient-to-b from-amber-400 to-orange-400"
            : "bg-gradient-to-b from-info to-blue-400"
        }`}
      />

      <div className="flex items-start gap-3 pl-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <h4 className={`font-display font-semibold text-sm leading-snug ${
            isComplete ? "line-through text-muted-foreground" : "text-card-foreground"
          }`}>
            {isComplete && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-success" />}
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
          {task.category && (
            <div className="mt-3 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                <Tag className="w-3 h-3" />
                {task.category}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all duration-150"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
