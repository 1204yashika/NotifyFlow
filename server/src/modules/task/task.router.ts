import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateBody } from '../../middlewares/validateBody.js';
import { validateQuery } from '../../middlewares/validateQuery.js';
import { createTaskSchema, updateTaskSchema, getTasksSchema } from './task.schema.js';
import {
    createTaskController as createTask,
    getTasksController as getTasks,
    getTaskController as getTask,
    updateTaskController as updateTask,
    deleteTaskController as deleteTask,
} from './task.controller.js';

const router = Router({ mergeParams: true });

router.post('/', authenticate, authorize(['owner', 'member']), validateBody(createTaskSchema), createTask);
router.get('/', authenticate, authorize(['owner', 'member', 'viewer']), validateQuery(getTasksSchema),  getTasks);
router.get('/:taskId', authenticate, authorize(['owner', 'member', 'viewer']),  getTask);
router.patch('/:taskId', authenticate, authorize(['owner', 'member']), validateBody(updateTaskSchema), updateTask);
router.delete('/:taskId',authenticate, authorize(['owner', 'member']), deleteTask);

export default router;
