// import { useState, useEffect, useCallback } from "react";
// import { Navbar } from "@/components/Navbar";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { SearchFilters } from "@/components/SearchFilters";
// import { TaskList } from "@/components/TaskList";
// import { Pagination } from "@/components/Pagination";

// import { mockApi } from "@/lib/mockData";
// import { Plus } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { toast as sonnerToast } from "sonner";
// import { AddTaskModal } from "@/components/modals/AddTaskModel";
// import { EditTaskModal } from "@/components/modals/EditTaskModal";
// import { DeleteTaskModal } from "@/components/modals/DeleteTaskModal";

// const Dashboard = () => {
//   const { toast } = useToast();
//   const [activeTab, setActiveTab] = useState("All");
//   const [tasks, setTasks] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [priority, setPriority] = useState("All");
//   const [sort, setSort] = useState("newest");

//   // Modals
//   const [showAddTask, setShowAddTask] = useState(false);
//   const [editingTask, setEditingTask] = useState(null);
//   const [deletingTask, setDeletingTask] = useState(null);

//   // Optimistic updates
//   const [optimisticTaskId, setOptimisticTaskId] = useState(null);
//   const [deletedTask, setDeletedTask] = useState(null);
//   const [undoTimeoutId, setUndoTimeoutId] = useState(null);

//   const pageSize = 8;

//   const fetchTasks = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const status = activeTab === "All" ? undefined : activeTab;
//       const data = await mockApi.getTasks(
//         currentPage,
//         pageSize,
//         status,
//         search,
//         priority,
//         sort
//       );
//       setTasks(data);
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to load tasks",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [activeTab, currentPage, search, priority, sort, toast]);

//   useEffect(() => {
//     fetchTasks();
//   }, [fetchTasks]);

//   // Reset to page 1 when filters change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [activeTab, search, priority, sort]);

//   const handleAddTask = async (taskData) => {
//     const optimisticId = `optimistic-${Date.now()}`;
//     const optimisticTask = {
//       ...taskData,
//       id: optimisticId,
//       status: "Pending",
//       createdAt: new Date(),
//     };

//     // Optimistic update
//     setOptimisticTaskId(optimisticId);
//     setTasks((prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         items: [optimisticTask, ...prev.items].slice(0, pageSize),
//         total: prev.total + 1,
//       };
//     });

//     try {
//       const newTask = await mockApi.createTask(taskData);

//       // Replace optimistic task with real task
//       setTasks((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           items: prev.items.map((t) => (t.id === optimisticId ? newTask : t)),
//         };
//       });

//       toast({
//         title: "Task created",
//         description: "Your task has been added successfully.",
//         duration: 3000,
//       });
//     } catch (error) {
//       // Revert optimistic update
//       setTasks((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           items: prev.items.filter((t) => t.id !== optimisticId),
//           total: prev.total - 1,
//         };
//       });

//       toast({
//         variant: "destructive",
//         title: "Failed to create task",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//         duration: 4000,
//       });
//     } finally {
//       setOptimisticTaskId(null);
//     }
//   };

//   const handleEditTask = async (id, updates) => {
//     const originalTask = tasks?.items.find((t) => t.id === id);
//     if (!originalTask) return;

//     // Optimistic update
//     setTasks((prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         items: prev.items.map((t) => (t.id === id ? { ...t, ...updates } : t)),
//       };
//     });

//     setOptimisticTaskId(id);

//     try {
//       await mockApi.updateTask(id, updates);
//       toast({
//         title: "Task updated",
//         description: "Your changes have been saved.",
//         duration: 3000,
//       });

//       // Refetch to ensure correct positioning
//       await fetchTasks();
//     } catch (error) {
//       // Revert optimistic update
//       setTasks((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           items: prev.items.map((t) => (t.id === id ? originalTask : t)),
//         };
//       });

//       toast({
//         variant: "destructive",
//         title: "Failed to update task",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//         duration: 4000,
//       });
//     } finally {
//       setOptimisticTaskId(null);
//     }
//   };

//   const handleDeleteTask = async (task) => {
//     if (undoTimeoutId) {
//       clearTimeout(undoTimeoutId);
//     }

//     // Optimistic update
//     setTasks((prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         items: prev.items.filter((t) => t.id !== task.id),
//         total: prev.total - 1,
//       };
//     });

//     setDeletingTask(null);
//     setDeletedTask(task);

//     try {
//       await mockApi.deleteTask(task.id);

//       // Show undo toast
//       const timeoutId = setTimeout(() => {
//         setDeletedTask(null);
//       }, 5000);
//       setUndoTimeoutId(timeoutId);

//       sonnerToast("Task deleted", {
//         description: "The task has been removed.",
//         action: {
//           label: "Undo",
//           onClick: () => handleUndoDelete(task),
//         },
//         duration: 5000,
//       });
//     } catch (error) {
//       // Revert optimistic update
//       setTasks((prev) => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           items: [task, ...prev.items],
//           total: prev.total + 1,
//         };
//       });
//       setDeletedTask(null);

//       toast({
//         variant: "destructive",
//         title: "Failed to delete task",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//         duration: 4000,
//       });
//     }
//   };

//   const handleUndoDelete = async (task) => {
//     if (undoTimeoutId) {
//       clearTimeout(undoTimeoutId);
//     }

//     setDeletedTask(null);

//     // Re-add task optimistically
//     setTasks((prev) => {
//       if (!prev) return prev;
//       return {
//         ...prev,
//         items: [task, ...prev.items],
//         total: prev.total + 1,
//       };
//     });

//     try {
//       await mockApi.createTask({
//         title: task.title,
//         description: task.description,
//         priority: task.priority,
//       });

//       toast({
//         title: "Task restored",
//         description: "Your task has been restored successfully.",
//         duration: 3000,
//       });

//       await fetchTasks();
//     } catch (error) {
//       toast({
//         variant: "destructive",
//         title: "Failed to restore task",
//         description:
//           error instanceof Error ? error.message : "Something went wrong",
//       });
//     }
//   };

//   const handleToggleComplete = async (id, currentStatus) => {
//     const newStatus = currentStatus ? "Pending" : "Completed";
//     await handleEditTask(id, { status: newStatus });
//   };

//   const taskCounts = {
//     All: tasks?.total || 0,
//     Pending: tasks?.items.filter((t) => t.status === "Pending").length || 0,
//     Completed: tasks?.items.filter((t) => t.status === "Completed").length || 0,
//   };

//   return (
//     <div className="min-h-screen bg-background page-transition">
//       <Navbar />

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-foreground">
//               Your Tasks
//             </h1>
//             <p className="text-muted-foreground mt-1">
//               Manage and organize your work efficiently
//             </p>
//           </div>
//           <Button onClick={() => setShowAddTask(true)} className="gap-2">
//             <Plus className="w-5 h-5" />
//             Add Task
//           </Button>
//         </div>

//         <div className="space-y-6">
//           <SearchFilters
//             onSearchChange={setSearch}
//             onPriorityChange={setPriority}
//             onSortChange={setSort}
//           />

//           <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
//             <TabsList className="grid w-full max-w-md grid-cols-3">
//               <TabsTrigger value="All">
//                 All {taskCounts.All > 0 && `(${taskCounts.All})`}
//               </TabsTrigger>
//               <TabsTrigger value="Pending">
//                 Pending {taskCounts.Pending > 0 && `(${taskCounts.Pending})`}
//               </TabsTrigger>
//               <TabsTrigger value="Completed">
//                 Completed{" "}
//                 {taskCounts.Completed > 0 && `(${taskCounts.Completed})`}
//               </TabsTrigger>
//             </TabsList>

//             <div className="mt-6">
//               <TabsContent value={activeTab} className="mt-0">
//                 <TaskList
//                   tasks={tasks?.items || []}
//                   onToggleComplete={handleToggleComplete}
//                   onEdit={setEditingTask}
//                   onDelete={setDeletingTask}
//                   isLoading={isLoading}
//                   optimisticTaskId={optimisticTaskId}
//                 />

//                 {tasks && tasks.totalPages > 1 && (
//                   <Pagination
//                     currentPage={currentPage}
//                     totalPages={tasks.totalPages}
//                     onPageChange={setCurrentPage}
//                   />
//                 )}
//               </TabsContent>
//             </div>
//           </Tabs>
//         </div>
//       </main>

//       {/* Modals */}
//       <AddTaskModal
//         open={showAddTask}
//         onOpenChange={setShowAddTask}
//         onSubmit={handleAddTask}
//       />

//       <EditTaskModal
//         task={editingTask}
//         open={!!editingTask}
//         onOpenChange={(open) => !open && setEditingTask(null)}
//         onSubmit={handleEditTask}
//       />

//       <DeleteTaskModal
//         task={deletingTask}
//         open={!!deletingTask}
//         onOpenChange={(open) => !open && setDeletingTask(null)}
//         onConfirm={() => deletingTask && handleDeleteTask(deletingTask)}
//       />
//     </div>
//   );
// };

// export default Dashboard;





















import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters } from "@/components/SearchFilters";
import { TaskList } from "@/components/TaskList";
import { Pagination } from "@/components/Pagination";

import { mockApi } from "@/lib/mockData";
import { Plus, Calendar, Filter, LayoutGrid, List, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { AddTaskModal } from "@/components/modals/AddTaskModel";
import { EditTaskModal } from "@/components/modals/EditTaskModal";
import { DeleteTaskModal } from "@/components/modals/DeleteTaskModal";

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("All");
  const [tasks, setTasks] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState("list"); // "list" or "grid"

  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  // Optimistic updates
  const [optimisticTaskId, setOptimisticTaskId] = useState(null);
  const [deletedTask, setDeletedTask] = useState(null);
  const [undoTimeoutId, setUndoTimeoutId] = useState(null);

  const pageSize = 8;

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const status = activeTab === "All" ? undefined : activeTab;
      const data = await mockApi.getTasks(
        currentPage,
        pageSize,
        status,
        search,
        priority,
        sort
      );
      setTasks(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to load tasks",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, search, priority, sort, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, priority, sort]);

  const handleAddTask = async (taskData) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTask = {
      ...taskData,
      id: optimisticId,
      status: "Pending",
      createdAt: new Date(),
    };

    // Optimistic update
    setOptimisticTaskId(optimisticId);
    setTasks((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [optimisticTask, ...prev.items].slice(0, pageSize),
        total: prev.total + 1,
      };
    });

    try {
      const newTask = await mockApi.createTask(taskData);

      // Replace optimistic task with real task
      setTasks((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((t) => (t.id === optimisticId ? newTask : t)),
        };
      });

      toast({
        title: "Task created",
        description: "Your task has been added successfully.",
        duration: 3000,
      });
    } catch (error) {
      // Revert optimistic update
      setTasks((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.filter((t) => t.id !== optimisticId),
          total: prev.total - 1,
        };
      });

      toast({
        variant: "destructive",
        title: "Failed to create task",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        duration: 4000,
      });
    } finally {
      setOptimisticTaskId(null);
    }
  };

  const handleEditTask = async (id, updates) => {
    const originalTask = tasks?.items.find((t) => t.id === id);
    if (!originalTask) return;

    // Optimistic update
    setTasks((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
    });

    setOptimisticTaskId(id);

    try {
      await mockApi.updateTask(id, updates);
      toast({
        title: "Task updated",
        description: "Your changes have been saved.",
        duration: 3000,
      });

      // Refetch to ensure correct positioning
      await fetchTasks();
    } catch (error) {
      // Revert optimistic update
      setTasks((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((t) => (t.id === id ? originalTask : t)),
        };
      });

      toast({
        variant: "destructive",
        title: "Failed to update task",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        duration: 4000,
      });
    } finally {
      setOptimisticTaskId(null);
    }
  };

  const handleDeleteTask = async (task) => {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    // Optimistic update
    setTasks((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.filter((t) => t.id !== task.id),
        total: prev.total - 1,
      };
    });

    setDeletingTask(null);
    setDeletedTask(task);

    try {
      await mockApi.deleteTask(task.id);

      // Show undo toast
      const timeoutId = setTimeout(() => {
        setDeletedTask(null);
      }, 5000);
      setUndoTimeoutId(timeoutId);

      sonnerToast("Task deleted", {
        description: "The task has been removed.",
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(task),
        },
        duration: 5000,
      });
    } catch (error) {
      // Revert optimistic update
      setTasks((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: [task, ...prev.items],
          total: prev.total + 1,
        };
      });
      setDeletedTask(null);

      toast({
        variant: "destructive",
        title: "Failed to delete task",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        duration: 4000,
      });
    }
  };

  const handleUndoDelete = async (task) => {
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
    }

    setDeletedTask(null);

    // Re-add task optimistically
    setTasks((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: [task, ...prev.items],
        total: prev.total + 1,
      };
    });

    try {
      await mockApi.createTask({
        title: task.title,
        description: task.description,
        priority: task.priority,
      });

      toast({
        title: "Task restored",
        description: "Your task has been restored successfully.",
        duration: 3000,
      });

      await fetchTasks();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to restore task",
        description:
          error instanceof Error ? error.message : "Something went wrong",
      });
    }
  };

  const handleToggleComplete = async (id, currentStatus) => {
    const newStatus = currentStatus ? "Pending" : "Completed";
    await handleEditTask(id, { status: newStatus });
  };

  const taskCounts = {
    All: tasks?.total || 0,
    Pending: tasks?.items.filter((t) => t.status === "Pending").length || 0,
    Completed: tasks?.items.filter((t) => t.status === "Completed").length || 0,
  };

  // Calculate completion percentage
  const completionPercentage = tasks?.total 
    ? Math.round((taskCounts.Completed / tasks.total) * 100)
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
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`px-3 ${viewMode === "list" ? "shadow-sm" : ""}`}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={`px-3 ${viewMode === "grid" ? "shadow-sm" : ""}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>

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
                <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold text-foreground mt-1">{taskCounts.All}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-[hsl(var(--primary))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-foreground mt-1">{taskCounts.Pending}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--priority-medium)/0.1)] flex items-center justify-center">
                <Filter className="w-6 h-6 text-[hsl(var(--priority-medium))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-foreground mt-1">{taskCounts.Completed}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--priority-low)/0.1)] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[hsl(var(--priority-low-foreground))]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion</p>
                <p className="text-3xl font-bold text-foreground mt-1">{completionPercentage}%</p>
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
                <TabsTrigger value="All" className="flex items-center gap-2 py-3">
                  All 
                  {taskCounts.All > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] rounded-full min-w-6">
                      {taskCounts.All}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="Pending" className="flex items-center gap-2 py-3">
                  Pending
                  {taskCounts.Pending > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--priority-medium)/0.1)] text-[hsl(var(--priority-medium))] rounded-full min-w-6">
                      {taskCounts.Pending}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="Completed" className="flex items-center gap-2 py-3">
                  Completed
                  {taskCounts.Completed > 0 && (
                    <span className="px-2 py-1 text-xs bg-[hsl(var(--priority-low)/0.1)] text-[hsl(var(--priority-low-foreground))] rounded-full min-w-6">
                      {taskCounts.Completed}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="text-sm text-muted-foreground">
                Showing {tasks?.items?.length || 0} of {tasks?.total || 0} tasks
              </div>
            </div>

            <div className="mt-2">
              <TabsContent value={activeTab} className="mt-0">
                <TaskList
                  tasks={tasks?.items || []}
                  onToggleComplete={handleToggleComplete}
                  onEdit={setEditingTask}
                  onDelete={setDeletingTask}
                  isLoading={isLoading}
                  optimisticTaskId={optimisticTaskId}
                  viewMode={viewMode}
                />

                {tasks && tasks.totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={tasks.totalPages}
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
        onSubmit={handleAddTask}
      />

      <EditTaskModal
        task={editingTask}
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleEditTask}
      />

      <DeleteTaskModal
        task={deletingTask}
        open={!!deletingTask}
        onOpenChange={(open) => !open && setDeletingTask(null)}
        onConfirm={() => deletingTask && handleDeleteTask(deletingTask)}
      />
    </div>
  );
};

export default Dashboard;








