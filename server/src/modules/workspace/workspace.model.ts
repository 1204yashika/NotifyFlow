import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'owner' | 'member' | 'viewer';

export interface IMember {
  userId: mongoose.Types.ObjectId;
  role: Role;
}

export interface IWorkspace extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: IMember[];
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    role: { 
      type: String, 
      enum: ['owner', 'member', 'viewer'], 
      required: true 
    },
  },
  { _id: false } // no separate _id for each member subdocument
);

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: { 
      type: String, 
      default: '',
      maxlength: 200,
    },
    owner: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    members: [memberSchema],
  },
  { timestamps: true }
);


workspaceSchema.index({"members.userId": 1});

workspaceSchema.index({owner: 1})

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);