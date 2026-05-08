import { Router } from "express";
import { validateBody } from "../../middlewares/validateBody.js";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { createWorkspaceSchema, inviteMemberSchema } from "./workspace.schema.js";
import { createWorkspaceController, getMyWorkspacesController, getWorkspaceController, inviteMemberController, removeMemberController } from "./workspace.controller.js";


const router = Router();

router.post('/', authenticate, validateBody(createWorkspaceSchema), createWorkspaceController);
router.get('/', authenticate, getMyWorkspacesController);
router.get('/:workspaceId', authenticate, authorize(['owner', 'member', 'viewer']), getWorkspaceController);
router.post('/:workspaceId/members', authenticate, authorize(['owner']), validateBody(inviteMemberSchema), inviteMemberController);
router.delete('/:workspaceId/members/:userId', authenticate, authorize(['owner']), removeMemberController);


export default router;