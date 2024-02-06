import mongoose, { Document } from 'mongoose';

export interface IProspect extends Document {
  nom: string;
  email: string;
  interets: string[];
  statut: 'Prospect' | 'Client';
  historiqueInteractions: mongoose.Types.ObjectId[];
}

const prospectSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  interets: [String],
  statut: { type: String, required: true, default: 'Prospect' },
  historiqueInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interaction' }],
}, { timestamps: true });

export default mongoose.models.Prospect || mongoose.model<IProspect>('Prospect', prospectSchema);
