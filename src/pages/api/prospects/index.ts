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

async function getProspects(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prospects = await Prospect.find({});
    res.status(200).json(prospects);
  } catch (error) {
    res.status(400).json({ success: false });
  }
}

async function createProspect(req: NextApiRequest, res: NextApiResponse) {
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
}

async function updateProspect(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'ID du prospect requis pour la mise à jour.' });
    return;
  }
  try {
    const value = await prospectSchema.validateAsync(req.body);
    const updatedProspect = await Prospect.findByIdAndUpdate(id, value, { new: true });
    res.status(200).json(updatedProspect);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour du prospect.' });
  }
}

async function deleteProspect(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: 'ID du prospect requis pour la suppression.' });
    return;
  }
  try {
    await Prospect.findOneAndDelete({ _id: id });
    res.status(204).end();
  } catch (error: any) {
    console.error(`Erreur lors de la suppression : ${error.message}`);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression du prospect.' });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  switch (req.method) {
    case 'GET':
      await getProspects(req, res);
      break;
    case 'POST':
      await createProspect(req, res);
      break;
    case 'PUT':
      await updateProspect(req, res);
      break;
    case 'DELETE':
      await deleteProspect(req, res);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}