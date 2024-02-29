import mongoose, { Document } from 'mongoose';

export interface IInteraction extends Document {
  type: 'Email' | 'Appel' | 'Réunion' | 'Autre';
  date: Date;
  notes: string;
  prospectId: mongoose.Schema.Types.ObjectId;
}

const interactionSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['Email', 'Appel', 'Réunion', 'Autre']},
  date: { type: Date, required: true},
  notes: { type: String, required: true},
  prospectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prospect', required: true},
}, { timestamps: true });

export default mongoose.models.Interaction || mongoose.model<IInteraction>('Interaction', interactionSchema);
