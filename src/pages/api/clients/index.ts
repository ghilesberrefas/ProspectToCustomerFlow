import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Client from '../../../models/Client'; 
import Prospect from '../../../models/Prospect';
import Joi from 'joi';

const clientSchema = Joi.object({
  prospectId: Joi.string().required(), 
  adresse: Joi.string().allow('', null),
  numeroTelephone: Joi.string().allow('', null),
  informationsPaiement: Joi.string().allow('', null),
});

async function getRequest(res: NextApiResponse) {
  try {
    const clients = await Client.find({}).populate('prospectId');
    const clientData = clients.map(client => {
      return {
        _id: client._id,
        nom: client.prospectId.nom, 
        email: client.prospectId.email,
        interets: client.prospectId.interets,
        adresse: client.adresse,
        numeroTelephone: client.numeroTelephone,
        informationsPaiement: client.informationsPaiement,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      };
    });
    res.status(200).json(clientData);
  } catch (error) {
    handleError(res, error, "Erreur lors de la récupération des clients.");
  }
}

async function postClient(req: NextApiRequest, res: NextApiResponse) {
  try {
    const value = await clientSchema.validateAsync(req.body);
    const existingClient = await Client.findOne({ prospectId: value.prospectId });
    if (existingClient) {
      return res.status(409).json({ success: false, error: "Ce prospect a déjà été converti en client." });
    }

    const prospect = await Prospect.findById(value.prospectId);
    if (!prospect) {
      return res.status(404).json({ success: false, error: "Prospect non trouvé." });
    }
    const prospectUpdated = await Prospect.findByIdAndUpdate(prospect._id, {
      statut: 'Client'}, { new: true });

    if (!prospectUpdated) {
      return res.status(404).json({ success: false, error: "Prospect associé non trouvé." });
    }

    const client = await Client.create(value);
    res.status(201).json(client);

  } catch (error) {
    handleError(res, error, "Erreur lors de la convetions en client.");
  }
}

async function deleteClient(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 
  if (id) {
    try {
      const clientToDelete = await Client.findById(id);
      if (!clientToDelete) {
        return res.status(404).json({ success: false, error: "Client non trouvé." });
      }
  
      const deletedClient = await Client.deleteOne({ _id: id });
      if (deletedClient.deletedCount === 0) {
        return res.status(404).json({ success: false, error: "Erreur lors de la suppression du client." });
      }
  
      const prospectUpdated = await Prospect.findByIdAndUpdate(clientToDelete.prospectId, {
        $unset: { statut: "" } 
      }, { new: true });
  
      if (!prospectUpdated) {
        console.log("Prospect associé non trouvé ou erreur lors de la mise à jour.");
      }
  
      res.status(200).json({ success: true, message: "Client supprimé et statut du prospect mis à jour." });
    } catch (error: any) {
      handleError(res, error, "Erreur lors de la suppression du client et de la mise à jour du prospect:")
    }
  } else {
    res.status(400).json({ error: 'ID du client requis pour la suppression.' });
  }
  
}

async function putClient(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query; 
  if (id) {
    try {
      const client = await Client.findById(id).populate('prospectId');
      if (!client) {
        return res.status(404).json({ success: false, error: "Client non trouvé." });
      }
  
      const prospectUpdated = await Prospect.findByIdAndUpdate(client.prospectId._id, {
        nom: req.body.nom,
        email: req.body.email,
        interets: req.body.interets
      }, { new: true });
  
      if (!prospectUpdated) {
        return res.status(404).json({ success: false, error: "Prospect associé non trouvé." });
      }
  
      const clientUpdated = await Client.findByIdAndUpdate(id, {
        adresse: req.body.adresse,
        numeroTelephone: req.body.numeroTelephone,
        informationsPaiement: req.body.informationsPaiement
      }, { new: true });
  
      const clientData = {
        _id: clientUpdated._id,
        nom: prospectUpdated.nom,
        email: prospectUpdated.email,
        interets: prospectUpdated.interets,
        adresse: clientUpdated.adresse,
        numeroTelephone: clientUpdated.numeroTelephone,
        informationsPaiement: clientUpdated.informationsPaiement,
        createdAt: clientUpdated.createdAt,
        updatedAt: clientUpdated.updatedAt
      };
      
      res.status(200).json(clientData);
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(400).json({ error: 'ID du client requis pour la suppression.' });
  }
}

function handleError(res: NextApiResponse, error: any, message: string) {
  console.log(message, error);
  res.status(400).json({ success: false, error: message });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  switch (req.method) {
    case 'GET':
      return getRequest(res);

    case 'POST':
        return postClient(req, res);

    case 'DELETE':
        return deleteClient(req, res);
    
    case 'PUT':
        return putClient(req, res);
          
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
