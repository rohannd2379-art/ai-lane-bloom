import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Task = Tables<"tasks">;

export function useTasks(userId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });

    if (error) {
      toast.error("Failed to load tasks");
      console.error(error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (title: string, description?: string, category?: string, dueDate?: string) => {
    if (!userId) return;
    const maxPos = tasks.length > 0 ? Math.max(...tasks.map((t) => t.position)) + 1 : 0;
    const newTask: TablesInsert<"tasks"> = {
      title,
      description: description || "",
      category: category || "",
      status: "todo",
      position: maxPos,
      user_id: userId,
      due_date: dueDate || null,
    };

    const { data, error } = await supabase.from("tasks").insert(newTask).select().single();
    if (error) {
      toast.error("Failed to create task");
    } else if (data) {
      setTasks((prev) => [...prev, data]);
      toast.success("Task created!");
    }
  };

  const updateTask = async (taskId: string, updates: { title: string; description: string; category: string; due_date: string | null }) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", taskId);
    if (error) {
      toast.error("Failed to update task");
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));
      toast.success("Task updated!");
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
    if (error) {
      toast.error("Failed to update task");
    } else {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    }
  };

  const updateTaskPosition = async (taskId: string, position: number, status: string) => {
    const { error } = await supabase.from("tasks").update({ position, status }).eq("id", taskId);
    if (error) {
      toast.error("Failed to reorder task");
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast.error("Failed to delete task");
    } else {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    }
  };

  return { tasks, setTasks, loading, addTask, updateTaskStatus, updateTaskPosition, deleteTask, refetch: fetchTasks };
}
