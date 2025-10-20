import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const AddTaskModal = ({ open, onOpenChange, onSubmit, isLoading }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!priority) {
      newErrors.priority = "Priority is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority: priority.toLowerCase(),
      });
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setErrors({});
      onOpenChange(false);
    } catch (error) {}
  };

  const handleClose = () => {
    if (title || description) {
      const confirm = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirm) return;
    }
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg" onEscapeKeyDown={handleClose}>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Create a new task to stay organized. All fields are required except
            description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors({ ...errors, title: undefined });
                }}
                placeholder="Enter task title"
                className={`mt-1 focus-ring ${
                  errors.title ? "border-destructive" : ""
                }`}
                autoFocus
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about this task..."
                className="mt-1 focus-ring min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="priority">
                Priority <span className="text-destructive">*</span>
              </Label>
              <Select
                value={priority}
                onValueChange={(value) => {
                  setPriority(value);
                  if (errors.priority)
                    setErrors({ ...errors, priority: undefined });
                }}
              >
                <SelectTrigger
                  id="priority"
                  className={`mt-1 focus-ring ${
                    errors.priority ? "border-destructive" : ""
                  }`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.priority}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
