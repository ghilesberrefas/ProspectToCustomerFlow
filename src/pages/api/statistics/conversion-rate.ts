import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Prospect from '../../../models/Prospect';
import Client from '../../../models/Client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const totalProspects = await Prospect.countDocuments();
  const totalClients = await Client.countDocuments();
  const conversionRate = (totalClients / totalProspects) * 100;

  res.status(200).json({ totalProspects, totalClients, conversionRate });
}
