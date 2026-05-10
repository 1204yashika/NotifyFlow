import mongoose, { Schema } from "mongoose";

// Status and Priority as enums
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  workspaceId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
	title: {
		type: String,
		required: true,
		trim: true,
		minlength: 2,
		maxlength: 100,
	},
	description: {
		type: String,
		default: '',
		maxlength: 500
	},
	status: {
		type: String,
		enum: ['todo', 'in_progress', 'done'],
		default: 'todo'
	},
	priority: {
		type: String,
		enum: ['low', 'medium', 'high'],
		default: 'medium'
	},
	workspaceId: {
		type: Schema.Types.ObjectId,
		ref: 'Workspace',
		required: true
	},
	assignedTo: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	dueDate: {
		type: Date,
		default: null
	}
  },
  {
	timestamps: true
  }
)

// indexes to add:
taskSchema.index({ workspaceId: 1, createdAt: -1 }); // for pagination
taskSchema.index({ assignedTo: 1 });                  // for "my tasks"
taskSchema.index({ workspaceId: 1, status: 1 });      // for kanban filter

export const Task = mongoose.model<ITask>('Task', taskSchema);