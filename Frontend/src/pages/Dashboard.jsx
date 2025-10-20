import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters } from "@/components/SearchFilters";
import { TaskList } from "@/components/TaskList";
import { Pagination } from "@/components/Pagination";
import { Plus, Calendar, Filter, LayoutGrid, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AddTaskModal } from "@/components/modals/AddTaskModel";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { DeleteTaskModal } from "@/components/modals/DeleteTaskModal";
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetMyTasksQuery,
  useUpdateTaskMutation,
} from "@/features/api/taskApi";
import { handleError } from "@/lib/handleError";
import { useDebounce } from "@/hooks/useDebounce";

const Dashboard = () => {
  // GET MY TASKS STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("newest");
  const [activeTab, setActiveTab] = useState("All");
  const debouncedSearch = useDebounce(search, 500);
  const pageSize = 8;

  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      size: pageSize,
    };

    // Only add filters to the params if they are not the default "All"
    if (priority !== "All") params.priority = priority.toLowerCase();
    if (activeTab !== "All") params.status = activeTab.toLowerCase();
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }

    // Map your frontend sort state to the backend's expected parameters
    if (sort === "oldest") {
      params.order_by = "created_at";
      params.order_desc = false;
    } else {
      // Default to 'newest'
      params.order_by = "created_at";
      params.order_desc = true;
    }

    return params;
  }, [currentPage, debouncedSearch, priority, sort, activeTab]);

  const { data: tasksData, isLoading } = useGetMyTasksQuery(queryParams);

  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, priority, sort]);

  // ADD TASK
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData).unwrap();
      toast.success("Task Created!", {
        description: "Your new task has been added to the list.",
      });
      setShowAddTask(false);
    } catch (err) {
      handleError(err, "Create Task");
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask({ taskId, taskData: updates }).unwrap();

      toast.success("Task Updated!", {
        description: "Your changes have been saved.",
      });
      setEditingTask(null);
    } catch (err) {
      handleError(err, "Update Task");
    }
  };

  const handleDeleteTask = async (taskToDelete) => {
    try {
      await deleteTask(taskToDelete.id).unwrap();
      toast.success("Task Deleted!", {
        description: "The task has been successfully removed.",
      });
      setDeletingTask(null);
    } catch (err) {
      handleError(err, "Delete Task");
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    // Determine the new status
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    try {
      // Call the updateTask mutation with only the status field
      await updateTask({
        taskId,
        taskData: { status: newStatus },
      }).unwrap();

      toast.success("Task status updated!");
    } catch (err) {
      handleError(err, "Update Status");
    }
  };

  const taskCounts = {
    All: tasksData?.total || 0,
    Pending: tasksData?.items.filter((t) => t.status === "pending").length || 0,
    Completed:
      tasksData?.items.filter((t) => t.status === "completed").length || 0,
  };

  // Calculate completion percentage
  const completionPercentage = tasksData?.total
    ? Math.round((taskCounts.Completed / tasksData.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background page-transition">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Task Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage and organize your work efficiently
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowAddTask(true)}
              className="gap-2 h-11 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] hover:shadow-lg transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tasks
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {taskCounts.All}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {taskCounts.Pending}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--priority-medium)/0.1)] flex items-center justify-center">
                <Filter className="w-6 h-6 text-[hsl(var(--priority-medium))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {taskCounts.Completed}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--priority-low)/0.1)] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--priority-low-foreground))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {completionPercentage}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--accent)/0.1)] flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--accent))] border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <SearchFilters
            onSearchChange={setSearch}
            onPriorityChange={setPriority}
            onSortChange={setSort}
          />

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList className="grid w-full sm:w-auto grid-cols-3 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger
                  value="All"
                  className="flex items-center justify-center gap-2"
                >
                  All
                  {taskCounts.All > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-full">
                      {taskCounts.All}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="Pending"
                  className="flex items-center justify-center gap-2"
                >
                  Pending
                  {taskCounts.Pending > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--priority-medium)/0.1)] text-[hsl(var(--priority-medium))] rounded-full">
                      {taskCounts.Pending}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="Completed"
                  className="flex items-center justify-center gap-2"
                >
                  Completed
                  {taskCounts.Completed > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--priority-low)/0.1)] text-[hsl(var(--priority-low-foreground))] rounded-full">
                      {taskCounts.Completed}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="text-sm text-muted-foreground">
                Showing {tasksData?.items?.length || 0} of{" "}
                {tasksData?.total || 0} tasks
              </div>
            </div>

            <div className="mt-2">
              <TabsContent value={activeTab} className="mt-0">
                <TaskList
                  tasks={tasksData?.items || []}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                  isLoading={isLoading}
                />

                {tasksData && tasksData.pages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={tasksData.pages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      {/* Modals */}
      <AddTaskModal
        open={showAddTask}
        onOpenChange={setShowAddTask}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />

      <EditTaskModal
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdateTask}
        isLoading={isUpdating}
      />

      <DeleteTaskModal
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={() => deletingTask && handleDeleteTask(deletingTask)}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Dashboard;
