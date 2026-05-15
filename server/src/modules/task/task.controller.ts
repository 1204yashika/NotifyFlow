import type { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/ApiResponse.js';
import {
    createTaskService,
    getWorkspaceTasks,
    getTaskById,
    updateTask,
    deleteTaskService,
} from './task.service.js';
import type { GetTasksInput } from './task.schema.js';

export async function createTaskController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const task = await createTaskService(
            req.body,
            req.params['workspaceId'] as string,
            req.user!.userId
        );
        res.status(201).json(new ApiResponse(201, 'Task created', task));
    } catch (err) {
        next(err);
    }
}

export async function getTasksController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const result = await getWorkspaceTasks(
            req.params['workspaceId'] as string,
            req.query as unknown as GetTasksInput
        );
        res.status(200).json(new ApiResponse(200, 'Tasks fetched', result));
    } catch (err) {
        next(err);
    }
}

export async function getTaskController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const task = await getTaskById(
            req.params['taskId'] as string,
            req.params['workspaceId'] as string
        );
        res.status(200).json(new ApiResponse(200, 'Task fetched', task));
    } catch (err) {
        next(err);
    }
}

export async function updateTaskController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const task = await updateTask(
            req.params['taskId'] as string,
            req.params['workspaceId'] as string,
            req.body,
            req.user!.userId
        );
        res.status(200).json(new ApiResponse(200, 'Task updated', task));
    } catch (err) {
        next(err);
    }
}

export async function deleteTaskController(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await deleteTaskService(
            req.params['taskId'] as string,
            req.params['workspaceId'] as string,
            req.user!.userId
        );
        res.status(200).json(new ApiResponse(200, 'Task deleted', null));
    } catch (err) {
        next(err);
    }
}
