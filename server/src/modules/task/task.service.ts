import mongoose from "mongoose";
import {
    createTask,
    findTaskById,
    updateTask as updateTaskRepo,
    deleteTask as deleteTaskRepo,
    getWorkspaceTasks as getWorkspaceTasksRepo,
} from "./task.repository.js";
import { findById, findMember } from "../workspace/workspace.repository.js";
import { ApiError } from "../../utils/ApiError.js";
import type { ITask } from "./task.model.js";
import type { CreateTaskInput, GetTasksInput, UpdateTaskInput } from "./task.schema.js";

export async function createTaskService(
    input: CreateTaskInput,
    workspaceId: string,
    createdBy: string
): Promise<ITask> {
    if (input.assignedTo) {
        const isMember = await findMember(workspaceId, input.assignedTo);
        if (!isMember) {
            throw new ApiError(400, "Assigned user is not a member of this workspace");
        }
    }

    return createTask({
        title:       input.title,
        description: input.description,
        priority:    input.priority,
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
        createdBy:   new mongoose.Types.ObjectId(createdBy),
        assignedTo:  input.assignedTo
            ? new mongoose.Types.ObjectId(input.assignedTo)
            : null,
        dueDate: input.dueDate
            ? new Date(input.dueDate)
            : null,
    });
}


export async function getWorkspaceTasks(
    workspaceId: string,
    query: GetTasksInput
) {

    const { limit, cursor, status, priority, assignedTo } = query;

    return getWorkspaceTasksRepo(
        new mongoose.Types.ObjectId(workspaceId),
        {
            ...(status     && { status }),
            ...(priority   && { priority }),
            ...(assignedTo && { assignedTo: new mongoose.Types.ObjectId(assignedTo) }),
        },
        limit,
        cursor
    );
}

export async function getTaskById(taskId: string, workspaceId: string): Promise<ITask> {
    const workspace = await findById(workspaceId);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    const task = await findTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.workspaceId.toString() !== workspaceId) {
        throw new ApiError(403, "Task does not belong to this workspace");
    }

    return task;
}

export async function updateTask(
    taskId: string,
    workspaceId: string,
    input: UpdateTaskInput,
    requestingUserId: string
): Promise<ITask> {

    const task = await findTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.workspaceId.toString() !== workspaceId) {
        throw new ApiError(403, "Task does not belong to this workspace");
    }

    if (input.assignedTo) {
        const isMember = await findMember(workspaceId, input.assignedTo);
        if (!isMember) {
            throw new ApiError(400, "Assigned user is not a member of this workspace");
        }
    }

    return updateTaskRepo(taskId, {
        ...(input.title  !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.priority !== undefined && { priority: input.priority }),
        ...(input.assignedTo !== undefined && { assignedTo: new mongoose.Types.ObjectId(input.assignedTo) }),
        ...(input.dueDate !== undefined && { dueDate: new Date(input.dueDate) }),
    });
}

export async function deleteTaskService(
    taskId: string,
    workspaceId: string,
    requestingUserId: string
): Promise<void> {
    const workspace = await findById(workspaceId);
    if (!workspace) {
        throw new ApiError(404, "Workspace not found");
    }

    const task = await findTaskById(taskId);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    if (task.workspaceId.toString() !== workspaceId) {
        throw new ApiError(403, "Task does not belong to this workspace");
    }

    const isCreator = task.createdBy.toString() === requestingUserId;
    const isOwner   = workspace.owner.toString() === requestingUserId;

    if (!isCreator && !isOwner) {
        throw new ApiError(403, "Only the task creator or workspace owner can delete this task");
    }

    await deleteTaskRepo(taskId);
}