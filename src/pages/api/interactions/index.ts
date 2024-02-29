import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Interaction from '../../../models/Interaction';
import Joi from 'joi';
import Prospect from '@/models/Prospect';

const interactionSchema = Joi.object({
  type: Joi.string().required(),
  date: Joi.date().required(),
  notes: Joi.string().required(),
  prospectId: Joi.string().required()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
        try {
          const interactions = await Interaction.find({});
          res.status(200).json(interactions);
        } catch (error: any) {
          res.status(400).json({ success: false, error: error.message });
        }
        break;
    case 'POST':
        try {
            const { type, date, notes, prospectId } = await interactionSchema.validateAsync(req.body);
            const prospect = await Prospect.findById(prospectId);
            if (!prospect) {
              return res.status(404).json({ message: "Prospect non trouvé" });
            }
        
            const interaction = await Interaction.create({ type, date, notes, prospectId });
            res.status(201).json(interaction);
        } catch (error:any) {
            res.status(400).json({ message: error.message });
        }
        break;
    case 'PUT':
        try {
            const { id } = req.query;
            const value = await interactionSchema.validateAsync(req.body);
            const interaction = await Interaction.findByIdAndUpdate(id, value, { new: true });
            if (!interaction) {
            return res.status(404).json({ success: false, error: "Interaction not found" });
            }
            res.status(200).json(interaction);
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
        break;

    case 'DELETE':
        try {
            const { id } = req.query;
            const deletedInteraction = await Interaction.findByIdAndDelete(id);
            if (!deletedInteraction) {
            return res.status(404).json({ success: false, error: "Interaction not found" });
            }
            res.status(204).json({ success: true });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
        break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// GET /api/interactions?prospectId=<ID_DU_PROSPECT>
export const getInteractionsByProspect = async (req: NextApiRequest, res: NextApiResponse) => {
    const { prospectId } = req.query;
  
    const interactions = await Interaction.find({ prospectId }).sort({ date: -1 });
    res.json(interactions);
};

