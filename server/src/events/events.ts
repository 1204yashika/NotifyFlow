export const Events = {
  // task events
  TASK_CREATED: 'task:created',
  TASK_UPDATED: 'task:updated',
  TASK_DELETED: 'task:deleted',

  // workspace events
  MEMBER_INVITED: 'workspace:member_invited',
  MEMBER_REMOVED: 'workspace:member_removed',

  // future events
  USER_MENTIONED: 'user:mentioned',
} as const;

export type AppEvent = typeof Events[keyof typeof Events];