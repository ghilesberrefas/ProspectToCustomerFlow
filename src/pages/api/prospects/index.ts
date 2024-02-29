import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Prospect from '../../../models/Prospect';
import Joi from 'joi';

const prospectSchema = Joi.object({
  nom: Joi.string().required(),
  email: Joi.string().email().required(),
  interets: Joi.array().items(Joi.string()),
  statut: Joi.string().valid('Prospect').required(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query;
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
      if (id) {
        try {
          const value = await prospectSchema.validateAsync(req.body);
          const updatedProspect = await Prospect.findByIdAndUpdate(id, value, {
            new: true, 
          });
          res.status(200).json(updatedProspect);
        } catch (error) {
          res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du prospect.' });
        }
      } else {
        res.status(400).json({ error: 'ID du prospect requis pour la mise à jour.' });
      }
      break;
    
    
      case 'DELETE':
        if (id) {
          try {
            await Prospect.findOneAndDelete({ _id: id });
            res.status(204).end(); 
          } catch (error: any) {
            console.error(`Erreur lors de la suppression : ${error.message}`);
            res.status(500).json({ success: false, error: 'Erreur lors de la suppression du prospect.' });
          }
        } else {
          res.status(400).json({ error: 'ID du prospect requis pour la suppression.' });
        }
        break;
      
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
