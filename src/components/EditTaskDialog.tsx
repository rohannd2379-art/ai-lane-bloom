import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Task } from "@/hooks/useTasks";

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: { title: string; description: string; category: string; due_date: string | null }) => void;
}

const EditTaskDialog = ({ task, open, onOpenChange, onSave }: EditTaskDialogProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [category, setCategory] = useState(task.category || "");
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined
  );
  const [dueTime, setDueTime] = useState(
    task.due_date ? format(new Date(task.due_date), "HH:mm") : ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let dueDateISO: string | null = null;
    if (dueDate) {
      const d = new Date(dueDate);
      if (dueTime) {
        const [h, m] = dueTime.split(":").map(Number);
        d.setHours(h, m, 0, 0);
      }
      dueDateISO = d.toISOString();
    }

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      due_date: dueDateISO,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl border-border/50 shadow-elevated">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11 rounded-xl bg-secondary border-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl bg-secondary border-0 resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-cat">Tag</Label>
            <Input
              id="edit-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Design, Dev, Research"
              className="h-11 rounded-xl bg-secondary border-0"
            />
          </div>
          <div className="space-y-2">
            <Label>Due Date & Time</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-11 rounded-xl bg-secondary border-0 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="h-11 w-32 rounded-xl bg-secondary border-0 pl-9"
                />
              </div>
            </div>
            {dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => { setDueDate(undefined); setDueTime(""); }}
              >
                Clear date
              </Button>
            )}
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl gradient-primary text-primary-foreground font-semibold">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
