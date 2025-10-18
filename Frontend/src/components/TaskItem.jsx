import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

export const TaskItem = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  isOptimistic = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === "Completed";

  const getPriorityVariant = (priority) => {
    const variants = {
      Low: "low",
      Medium: "medium",
      High: "high",
    };
    return variants[priority];
  };

  return (
    <div
      className={`
        group bg-card rounded-lg border p-4 transition-all duration-200
        hover-lift
        ${isOptimistic ? "opacity-60" : ""}
        ${isCompleted ? "opacity-75" : ""}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="relative pt-1">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(task.id, isCompleted)}
            className={isOptimistic ? "pointer-events-none" : ""}
          />
          {isOptimistic && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-t-primary rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-medium text-foreground truncate ${
                  isCompleted ? "line-through" : ""
                }`}
              >
                {task.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {task.description}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(task)}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(task)}
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getPriorityVariant(task.priority)}>
              {task.priority}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {format(new Date(task.createdAt), "MMM d, yyyy")}
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 ml-auto transition-colors"
            >
              {isExpanded ? (
                <>
                  Less <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  More <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {isExpanded && (
            <div className="mt-3 pt-3 border-t space-y-2 animate-fade-in">
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-muted-foreground">
                  {task.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Priority
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {task.priority}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Status</p>
                  <p className="text-xs text-muted-foreground">{task.status}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">Created</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(task.createdAt), "PPP")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
