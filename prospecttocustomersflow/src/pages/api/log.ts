import type { NextApiRequest, NextApiResponse } from 'next';
import logger from '../../utils/logger';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { level, message } = req.body;

  switch (level) {
    case 'info':
      logger.info(message);
      break;
    case 'error':
      logger.error(message);
      break;
    case 'warning': 
      logger.warning(message);
      break;
  }

  res.status(200).json({ success: true });
}
