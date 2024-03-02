import mongoose, { Document } from 'mongoose';

export interface IClient extends Document {
  prospectId: mongoose.Types.ObjectId; // Foreign key pointing to Prospect ID
  adresse: string | null;
  numeroTelephone: string | null;
  informationsPaiement: string | null;
}

const clientSchema = new mongoose.Schema({
  prospectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prospect', required: true },
  adresse: { type: String, default: null },
  numeroTelephone: { type: String, default: null },
  informationsPaiement: { type: String, default: null },
}, { timestamps: true });


export default mongoose.models.Client ?? mongoose.model<IClient>('Client', clientSchema);
