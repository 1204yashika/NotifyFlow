import mongoose from "mongoose";
import { Task, type ITask, type TaskPriority } from "./task.model.js";
import { ApiError } from "../../utils/ApiError.js";

type CreateTaskData = {
    title: string;
    description?: string;
    priority?: TaskPriority;
    assignedTo?: mongoose.Types.ObjectId | null;
    dueDate?: Date | null;
    workspaceId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
};

type UpdateTaskData = Partial<Omit<CreateTaskData, 'workspaceId' | 'createdBy'>> & {
    status?: 'todo' | 'in_progress' | 'done';
};



export async function createTask(data: CreateTaskData): Promise<ITask> {
    const task = await Task.create(data);

    if(!task){
        throw new ApiError(500, "task cannot be created");
    }

    return task;
}


export async function findTaskById(id: string): Promise<ITask | null> {
    return Task.findById(id);
}

export async function updateTask(taskId: string, data: UpdateTaskData): Promise<ITask> {
    const task = await Task.findByIdAndUpdate(taskId, data, { new: true });

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    return task;
}

type GetTasksFilters = {
    status?: 'todo' | 'in_progress' | 'done';
    priority?: TaskPriority;
    assignedTo?: mongoose.Types.ObjectId;
};

type GetTasksResult = {
    tasks: ITask[];
    nextCursor: string | null;
};

export async function getWorkspaceTasks(
    workspaceId: mongoose.Types.ObjectId,
    filters: GetTasksFilters,
    limit: number,
    cursor?: string
): Promise<GetTasksResult> {
    const query: Record<string, unknown> = { workspaceId };

    if (filters.status)     query.status     = filters.status;
    if (filters.priority)   query.priority   = filters.priority;
    if (filters.assignedTo) query.assignedTo = filters.assignedTo;
    if (cursor)             query.createdAt  = { $lt: new Date(cursor) };

    const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1);

    const hasMore = tasks.length > limit;
    if (hasMore) tasks.pop();

    const nextCursor = hasMore
        ? tasks.at(-1)!.createdAt.toISOString()
        : null;

    return { tasks, nextCursor };
}

export async function deleteTask(taskId: string): Promise<void> {
    const task = await Task.findByIdAndDelete(taskId);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }
}