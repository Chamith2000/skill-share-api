// Object shapes for reference
// Task: { id: number, description: string, completed: boolean, dueDate: string, completedAt: string | null }
// LearningPlan: { id: number, createdAt: string, startDate: string, endDate: string, topic: string, resources: string, timeLine: string, extended: boolean, tasks: Task[] }
// CreateLearningPlanDTO: { userId: number, topic: string, resources: string, timeline: string, createdAt?: string, startDate: string, endDate: string, extended: boolean, tasks: Task[] }

export const defaultTask = {
    description: '',
    completed: false,
    dueDate: '',
    completedAt: null
};

export const defaultLearningPlanDTO = {
    userId: 1,
    topic: '',
    resources: '',
    timeline: '',
    createdAt: new Date().toISOString(),
    startDate: '',
    endDate: '',
    extended: false,
    tasks: []
};