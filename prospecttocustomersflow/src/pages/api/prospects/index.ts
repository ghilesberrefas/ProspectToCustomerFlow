import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Prospect from '../../../models/Prospect';
import Joi from 'joi';

const prospectSchema = Joi.object({
  nom: Joi.string().required(),
  email: Joi.string().email().required(),
  interets: Joi.array().items(Joi.string()),
  statut: Joi.string().valid('Prospect', 'Client').required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      try {
        const prospects = await Prospect.find({}); 
        res.status(200).json(prospects);
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;

    case 'POST':
    try {
        const value = await prospectSchema.validateAsync(req.body);
        const prospect = await Prospect.create(value);
        res.status(201).json(prospect);
    } catch (error) {
      const mongoError = error as Error & { code?: number };
      if (mongoError.code === 11000) {
        res.status(400).json({ success: false, error: "Email déjà utilisé." });
      } else {
        res.status(400).json({ success: false, error: mongoError.message });
      }
    }
    break;

    case 'PUT':
      try {
        const value = await prospectSchema.validateAsync(req.body);
        const updatedProspect = await Prospect.findByIdAndUpdate(req.query.id, value, {
          new: true, // Renvoie le prospect mis à jour
        });
        res.status(200).json(updatedProspect);
      } catch (error) {
        // Gérer l'erreur de mise à jour ici
      }
      break;
    
    case 'DELETE':
      try {
        await Prospect.findOneAndDelete({ _id: req.query.id });
        res.status(204).end(); // 204 signifie "No Content" (suppression réussie)
      } catch (error) {
        // Gérer l'erreur de suppression ici
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
