import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import AddTaskDialog from "./AddTaskDialog";
import TaskCard from "./TaskCard";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import confetti from "canvas-confetti";

const fireConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#34d399", "#6ee7b7", "#a78bfa", "#818cf8"],
  });
};

const COLUMNS = ["todo", "in_progress", "complete"] as const;

const KanbanBoard = () => {
  const { user } = useAuth();
  const { tasks, setTasks, loading, addTask, updateTaskPosition, deleteTask } = useTasks(user?.id);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [search, setSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(search.toLowerCase())
  );

  const todoTasks = filteredTasks.filter((t) => t.status === "todo");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "in_progress");
  const completeTasks = filteredTasks.filter((t) => t.status === "complete");

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Check if dropping over a column
    if (COLUMNS.includes(overId as any)) {
      if (activeTask.status !== overId) {
        setTasks((prev) =>
          prev.map((t) => (t.id === activeId ? { ...t, status: overId } : t))
        );
      }
      return;
    }

    // Dropping over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (!overTask) return;

    if (activeTask.status !== overTask.status) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overTask.status } : t))
      );
    }
  };

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id as string;
    const task = tasks.find((t) => t.id === activeId);
    if (!task) return;

    // Fire confetti when moved to complete
    if (task.status === "complete") {
      fireConfetti();
    }

    // Get tasks in the target column
    const columnTasks = tasks.filter((t) => t.status === task.status);
    const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
    const overTask = columnTasks.find((t) => t.id === (over.id as string));
    const newIndex = overTask ? columnTasks.indexOf(overTask) : columnTasks.length - 1;

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(columnTasks, oldIndex, newIndex);
      const updatedTasks = tasks.map((t) => {
        const idx = reordered.findIndex((r) => r.id === t.id);
        if (idx !== -1) return { ...t, position: idx };
        return t;
      });
      setTasks(updatedTasks);
      reordered.forEach((t, i) => updateTaskPosition(t.id, i, task.status));
    } else {
      updateTaskPosition(activeId, task.position, task.status);
    }
  }, [tasks, setTasks, updateTaskPosition]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 flex items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Task Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9 h-11 rounded-xl bg-secondary border-0"
          />
        </div>
        <AddTaskDialog onAdd={addTask} />
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto px-8 pb-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-5 h-full">
            <KanbanColumn id="todo" title="To Do" tasks={todoTasks} onDelete={deleteTask} />
            <KanbanColumn id="in_progress" title="In Progress" tasks={inProgressTasks} onDelete={deleteTask} />
            <KanbanColumn id="complete" title="Complete" tasks={completeTasks} onDelete={deleteTask} />
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard;
