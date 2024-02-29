import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Interaction from '../../../models/Interaction';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    const interactionStats = await Interaction.aggregate([
      { $match: { } },
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    res.status(200).json(interactionStats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
