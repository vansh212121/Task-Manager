export const mockUser = {
  id: "1",
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
}

// Generate mock tasks
export const generateMockTasks = count => {
  const titles = [
    "Complete project proposal",
    "Review design mockups",
    "Update documentation",
    "Schedule team meeting",
    "Fix critical bugs",
    "Implement new feature",
    "Conduct user research",
    "Prepare presentation",
    "Optimize performance",
    "Write test cases",
    "Deploy to staging",
    "Review pull requests",
    "Update dependencies",
    "Create wireframes",
    "Plan sprint goals",
    "Refactor codebase",
    "Setup CI/CD pipeline",
    "Analyze user feedback"
  ]

  const descriptions = [
    "This task requires careful attention to detail and thorough testing.",
    "Collaborate with the team to ensure all requirements are met.",
    "Follow best practices and maintain code quality standards.",
    "Consider edge cases and potential user scenarios.",
    "Document all changes and update relevant stakeholders."
  ]

  const priorities = ["Low", "Medium", "High"]
  const statuses = ["Pending", "Completed"]

  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    title: titles[i % titles.length],
    description: descriptions[i % descriptions.length],
    priority: priorities[i % 3],
    status: i % 3 === 0 ? "Completed" : "Pending",
    createdAt: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000)
  }))
}

export let mockTasks = generateMockTasks(25)

// Mock API functions
export const mockApi = {
  login: async (email, password, rememberMe) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (email === "test@example.com" && password === "password123") {
      localStorage.setItem("isAuthenticated", "true")
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }
      return { success: true, user: mockUser }
    }
    throw new Error("Invalid credentials")
  },

  signup: async (name, email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    if (email === "existing@example.com") {
      throw new Error("Email already exists")
    }
    localStorage.setItem("isAuthenticated", "true")
    return { success: true, user: { ...mockUser, name, email } }
  },

  logout: async () => {
    await new Promise(resolve => setTimeout(resolve, 300))
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("rememberMe")
    return { success: true }
  },

  getTasks: async (page, pageSize, status, search, priority, sort) => {
    await new Promise(resolve => setTimeout(resolve, 500))

    let filtered = [...mockTasks]

    // Filter by status
    if (status && status !== "All") {
      filtered = filtered.filter(task => task.status === status)
    }

    // Search
    if (search) {
      const query = search.toLowerCase()
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      )
    }

    // Filter by priority
    if (priority && priority !== "All") {
      filtered = filtered.filter(task => task.priority === priority)
    }

    // Sort
    if (sort === "newest") {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } else if (sort === "oldest") {
      filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    } else if (sort === "priority") {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      filtered.sort(
        (a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]
      )
    }

    const total = filtered.length
    const totalPages = Math.ceil(total / pageSize)
    const start = (page - 1) * pageSize
    const items = filtered.slice(start, start + pageSize)

    return {
      items,
      total,
      page,
      pageSize,
      totalPages
    }
  },

  createTask: async task => {
    await new Promise(resolve => setTimeout(resolve, 600))
    // Simulate 10% failure rate
    if (Math.random() < 0.1) {
      throw new Error("Failed to create task. Please try again.")
    }
    const newTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      status: "Pending"
    }
    mockTasks = [newTask, ...mockTasks]
    return newTask
  },

  updateTask: async (id, updates) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const index = mockTasks.findIndex(t => t.id === id)
    if (index === -1) throw new Error("Task not found")
    mockTasks[index] = { ...mockTasks[index], ...updates }
    return mockTasks[index]
  },

  deleteTask: async id => {
    await new Promise(resolve => setTimeout(resolve, 400))
    const task = mockTasks.find(t => t.id === id)
    if (!task) throw new Error("Task not found")
    mockTasks = mockTasks.filter(t => t.id !== id)
    return task
  },

  updateProfile: async (name, email) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    if (email === "taken@example.com") {
      throw new Error("Email is already taken")
    }
    return { success: true }
  },

  updatePassword: async (current, newPass) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    if (current !== "password123") {
      throw new Error("Current password is incorrect")
    }
    return { success: true }
  },

  deleteAccount: async () => {
    await new Promise(resolve => setTimeout(resolve, 800))
    localStorage.clear()
    return { success: true }
  }
}
