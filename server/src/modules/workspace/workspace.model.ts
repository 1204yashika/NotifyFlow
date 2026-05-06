import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: {
    userId: mongoose.Types.ObjectId;
    role: 'owner' | 'member' | 'viewer';
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'member', 'viewer'], default: 'member' },
      },
    ],
  },
  { timestamps: true }
);

export const Workspace = mongoose.model<IWorkspace>('Workspace', workspaceSchema);