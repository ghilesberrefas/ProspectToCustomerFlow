import React, { useState, FormEvent, useEffect } from 'react';
import {logError} from './addProspect'

interface Client {
  _id: string;
  nom: string;
  email: string;
  interets: string[];
  statut: 'Client'; 
  adresse: string;
  numeroTelephone: string;
  informationsPaiement: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [nom, setNom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [interets, setInterets] = useState<string>('');
  const [adresse, setAdresse] = useState<string>('');
  const [numeroTelephone, setNumeroTelephone] = useState<string>('');
  const [informationsPaiement, setInformationsPaiement] = useState<string>('');
  const [enEdition, setEnEdition] = useState<boolean>(false);
  const [clientEnCoursDeModification, setClientEnCoursDeModification] = useState<Client | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/clients');
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        } else {
            throw new Error();
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des Clients:', error);
        logError(`Erreur lors de la récupération des Clients: ${error}`);
        setErrorMessage('Impossible de charger les Clients. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const supprimerClient = async (clientId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const response = await fetch(`/api/clients?id=${clientId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          const updatedclients = clients.filter((client) => client._id !== clientId);
          setClients(updatedclients);
        } else {
          const errorData = await response.json();
          logError(`Erreur lors de la supprision du client : ${errorData.error}`);
          throw new Error(`Erreur lors de la supprision du client: ${errorData.error}`);
        }
      } catch (error: any) {
        logError(`Erreur lors de la suppression du client : ${error}`);
        setErrorMessage("Erreur lors de la suppression du client.");
      }
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (clientEnCoursDeModification) {
        const body = {
            nom,
            email,
            interets: interets.split(',').map(interet => interet.trim()),
            adresse,
            numeroTelephone,
            informationsPaiement,
        };
        const response = await fetch(`/api/clients/?id=${clientEnCoursDeModification._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (response.ok) {
            const updatedClient = await response.json();
            setClients(clients.map(c => c._id === updatedClient._id ? updatedClient : c));
            setEnEdition(false); 
        } else {
          const errorData = await response.json();
          logError(`Erreur lors de la mise à jour : ${errorData.error}`);
          throw new Error(`Erreur lors de la mise à jour : ${errorData.error}`);
        }
      } else {
        setErrorMessage('Aucun prospect en cours de modification.');
      }
    } catch (error: any) {
      console.error(`Erreur lors de la mise à jour : ${error.message}`);
      logError(`Erreur lors de la mise à jour : ${error.message}`);
      setErrorMessage(`Une erreur s'est produite lors de la mise à jour du prospect.`);
    }
  };

  const modifierClient = async (client: Client) => {
    setEnEdition(true);
    setNom(client.nom);
    setEmail(client.email);
    setInterets(client.interets.join(', '));
    setAdresse(client.adresse);
    setNumeroTelephone(client.numeroTelephone);
    setInformationsPaiement(client.informationsPaiement);
    setClientEnCoursDeModification(client);
    
  };

  const resetForm = () => {
    setNom('');
    setEmail('');
    setInterets('');
    setAdresse('');
    setNumeroTelephone('');
    setInformationsPaiement('');
    setEnEdition(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 text-gray-800">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
        <span className="sr-only">Chargement...</span>
      </div>
    );
  }

  return (

    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-4 sm:px-6 lg:px-8">
        {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur !</strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
    )}
      <h2 className="text-2xl font-bold text-center mb-6">Gestion des Clients</h2>

      {
        enEdition ? (
            <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Modifier Clients</h3>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="text"
            value={interets}
            onChange={(e) => setInterets(e.target.value)}
            placeholder="Intérêts (séparés par des virgules)"
          />

    <input
        className="w-full p-2 border rounded"
        type="text"
        value={adresse}
        autoFocus
        onChange={(e) => setAdresse(e.target.value)}
        placeholder="Adresse"
        required
      />
      <input
        className="w-full p-2 border rounded"
        type="tel"
        value={numeroTelephone}
        onChange={(e) => setNumeroTelephone(e.target.value)}
        placeholder="numero de Telephone"
        required
      />
      <input
        className="w-full p-2 border rounded"
        type="text"
        value={informationsPaiement}
        onChange={(e) => setInformationsPaiement(e.target.value)}
        placeholder="IBAN"
        required
      />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
        ) : ( <div></div>)
      }
    <h2 className="text-2xl font-bold text-center my-6">Liste des Clients</h2>
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
        <tr>
            <th scope="col" className="py-3 px-6">Nom</th>
            <th scope="col" className="py-3 px-6">Email</th>
            <th scope="col" className="py-3 px-6">Intérêts</th>
            <th scope="col" className="py-3 px-6">Adresse</th>
            <th scope="col" className="py-3 px-6">Numéro de Téléphone</th>
            <th scope="col" className="py-3 px-6">Informations de Paiement</th>
            <th scope="col" className="py-3 px-6">Actions</th>
        </tr>
        </thead>
        <tbody>
        {clients.map((client) => (
            <tr key={client._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td className="px-6 py-4">{client.nom}</td>
            <td className="px-6 py-4">{client.email}</td>
            <td className="px-6 py-4">{client.interets ? client.interets.join(', ') : 'N/A'}</td>
            <td className="px-6 py-4">{client.adresse}</td>
            <td className="px-6 py-4">{client.numeroTelephone}</td>
            <td className="px-6 py-4">{client.informationsPaiement}</td>
            <td className="px-6 py-4 text-right">
                <button onClick={() => supprimerClient(client._id)}
                className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                <button onClick={() => modifierClient(client)}
                className="font-medium text-blue-600 dark:text-blue-500 hover:underline ml-2">Modifier</button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>
    </div>
  );
};

export default Clients;
