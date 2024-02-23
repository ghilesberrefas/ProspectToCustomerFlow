import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongodb';
import Client from '../../../models/Client'; // Assurez-vous d'avoir un modèle Client
import Prospect from '../../../models/Prospect'; // Importez le modèle Prospect pour la conversion
import Joi from 'joi';

// Définissez un schéma Joi pour la validation des données client
const clientSchema = Joi.object({
  prospectId: Joi.string().required(), // Assurez-vous que le prospectId est valide
  adresse: Joi.string().allow('', null),
  numeroTelephone: Joi.string().allow('', null),
  informationsPaiement: Joi.string().allow('', null),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { id } = req.query; // Utilisé pour les opérations PUT et DELETE spécifiques à un client
  console.log(`[${req.method}] handler = ${id}`);

  switch (req.method) {
    case 'GET':
      try {
        // Assurez-vous que la méthode find() récupère toutes les informations nécessaires.
        // Si les clients sont dans une collection séparée et ont déjà toutes les infos nécessaires, cette approche est correcte.
        const clients = await Client.find({}).populate('prospectId');
        const clientData = clients.map(client => {
          return {
            _id: client._id,
            nom: client.prospectId.nom, // Assurez-vous que prospectId est peuplé
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
        console.error("Erreur lors de la récupération des clients:", error);
        res.status(400).json({ success: false, error: "Erreur lors de la récupération des clients." });
      }
      break;

    case 'POST':
        try {
          const value = await clientSchema.validateAsync(req.body);
  
          // Vérifier si le prospect a déjà été converti
          const existingClient = await Client.findOne({ prospectId: value.prospectId });
          if (existingClient) {
            return res.status(409).json({ success: false, error: "Ce prospect a déjà été converti en client." });
          }
  
          const prospect = await Prospect.findById(value.prospectId);
          if (!prospect) {
            return res.status(404).json({ success: false, error: "Prospect non trouvé." });
          }

          // Mettre à jour le statut du prospect
          const prospectUpdated = await Prospect.findByIdAndUpdate(prospect._id, {
            statut: 'Client'}, { new: true });
      
          if (!prospectUpdated) {
            return res.status(404).json({ success: false, error: "Prospect associé non trouvé." });
          }
  
          console.log(value);
          const client = await Client.create(value);
          res.status(201).json(client);
  
        } catch (error) {
          const mongoError = error as Error & { code?: number };
          res.status(400).json({ success: false, error: mongoError.message });
        }
        break;

        case 'DELETE':
          if (id) {
            try {
              // Récupérer le client pour obtenir l'ID du prospect associé
              const clientToDelete = await Client.findById(id);
              if (!clientToDelete) {
                return res.status(404).json({ success: false, error: "Client non trouvé." });
              }
        
              // Suppression du client
              const deletedClient = await Client.deleteOne({ _id: id });
              if (deletedClient.deletedCount === 0) {
                // Si aucun document n'a été supprimé, renvoyez une erreur
                return res.status(404).json({ success: false, error: "Erreur lors de la suppression du client." });
              }
        
              // Mise à jour du statut du prospect associé
              const prospectUpdated = await Prospect.findByIdAndUpdate(clientToDelete.prospectId, {
                $unset: { statut: "" } // Ou utiliser $set si vous voulez explicitement marquer comme "Prospect"
              }, { new: true });
        
              if (!prospectUpdated) {
                // Si la mise à jour du prospect échoue, vous pourriez vouloir gérer cela différemment
                console.log("Prospect associé non trouvé ou erreur lors de la mise à jour.");
              }
        
              res.status(200).json({ success: true, message: "Client supprimé et statut du prospect mis à jour." });
            } catch (error: any) {
              console.error("Erreur lors de la suppression du client et de la mise à jour du prospect:", error);
              res.status(400).json({ success: false, error: error.message });
            }
          } else {
            res.status(400).json({ error: 'ID du client requis pour la suppression.' });
          }
          break;
        

      case 'PUT':
        if (id) {
        try {
          // Récupérer le client et le prospect associé
          const client = await Client.findById(id).populate('prospectId');
          if (!client) {
            return res.status(404).json({ success: false, error: "Client non trouvé." });
          }
      
          // Mettre à jour les informations du prospect
          const prospectUpdated = await Prospect.findByIdAndUpdate(client.prospectId._id, {
            nom: req.body.nom,
            email: req.body.email,
            interets: req.body.interets
          }, { new: true });
      
          if (!prospectUpdated) {
            return res.status(404).json({ success: false, error: "Prospect associé non trouvé." });
          }
      
          // Mettre à jour les informations spécifiques du client
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
        break;
          
    // Ajoutez les cas PUT et DELETE si nécessaire, en suivant un modèle similaire à celui des prospects

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
