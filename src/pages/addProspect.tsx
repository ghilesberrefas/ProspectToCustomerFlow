import { useRouter } from 'next/router';
import { useState, FormEvent, useEffect } from 'react';

export const logError = async (message: string) => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ level: 'error', message }),
    });
  } catch (error) {
    console.error('Erreur lors de l’envoi du log', error);
  }
};


export interface Prospect {
  _id: string;
  nom: string;
  email: string;
  interets: string[];
  statut: string;
}

const AddProspect = () => {
  const [nom, setNom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [interets, setInterets] = useState<string>(''); 
  const [statut, setStatut] = useState<'Prospect' | 'Client'>('Prospect');
  const [adresse, setAdresse] = useState<string>('');
  const [numeroTelephone, setNumeroTelephone] = useState<string>('');
  const [enEdition, setEnEdition] = useState<boolean>(false);
  const [enConversion, setEnConversion] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [informationsPaiement, setInformationsPaiement] = useState<string>('');
  const [prospects, setProspects] =  useState<Prospect[]>([]);
  const [prospectEnCoursDeModification, setProspectEnCoursDeModification] = useState<Prospect | null>(null);
  const [prospectEnCoursDeConversion, setProspectEnCoursDeConversion] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const fetchProspects = async () => {
      try {
        const response = await fetch('/api/prospects');
        if (response.ok) {
          const data = await response.json();
          setProspects(data);
        } else {
          throw new Error();
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des prospects:', error);
        logError(`Erreur lors de la récupération des prospects: ${error}`);
        setErrorMessage('Impossible de charger les prospects. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    fetchProspects();
  }, []); 

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const body = { 
        nom, 
        email, 
        interets: interets.split(',').map(interet => interet.trim()), 
        statut,
      };
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });


      if (response.ok) {
        const newProspect = await response.json();
        setProspects([...prospects, newProspect]); 
        setNom('');
        setEmail('');
        setInterets('');
        setStatut('Prospect');
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        logError(`Erreur: ${errorData.error}`);
        console.log(`Erreur: ${errorData.error}`);
        throw new Error();
      }
    } catch (error: any) {
      console.error(error);
      logError(`Erreur lors de l'ajout d'un propect: ${error}`);
      setErrorMessage("Erreur lors de l'ajout du propect");
    }
  };

  const supprimerProspect = async (prospectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      try {
        const response = await fetch(`/api/prospects?id=${prospectId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          const updatedProspects = prospects.filter((prospect) => prospect._id !== prospectId);
          setProspects(updatedProspects);
          setErrorMessage('');
        } else {
          const errorData = await response.json();
          logError(`Erreur lors de la supression du prospect: ${errorData.error}`);
          throw new Error();
        }
      } catch (error: any) {
        logError(`Erreur lors de la suppression du prospect : ${error}`);
        setErrorMessage("Erreur lors de la suppression du prospect.");
      }
    }
  };
  
  
  const modifierProspect = async (prospect: Prospect) => {
    annulerConversion();
    setEnEdition(true);
    setNom(prospect.nom);
    setEmail(prospect.email);
    setInterets(prospect.interets.join(', '));
    setStatut(prospect.statut as 'Prospect' | 'Client');
    setProspectEnCoursDeModification(prospect);
  };

  const soumettreModification = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (prospectEnCoursDeModification) {
        const body = { 
          nom, 
          email, 
          interets: interets.split(',').map(interet => interet.trim()), 
          statut,
        };
        const response = await fetch(`/api/prospects?id=${prospectEnCoursDeModification._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (response.ok) {
          const updatedProspect = await response.json(); 
          setProspects(prospects.map(p => p._id === updatedProspect._id ? updatedProspect : p));
          setErrorMessage('');
        } else {
          const errorData = await response.json();
          logError(`Erreur lors de la mise à jour : ${errorData.error}`);
          throw new Error();
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

  
  
    
  const annulerEdition = () => {
    setEnEdition(false);
    setNom('');
    setEmail('');
    setInterets('');

  };

const SubmitConversion = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (prospectEnCoursDeConversion) {
        const body = {
          prospectId: prospectEnCoursDeConversion._id,
          adresse,
          numeroTelephone,
          informationsPaiement,
        };
        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (response.ok) {
          await response.json();
          router.push('/clients');
          
        } else if (response.status === 409) {
          setErrorMessage("Ce prospect a déjà été converti en client.");
          annulerConversion();
        } else {
          const errorData = await response.json();
          console.log(errorData);
          alert(`Erreur lors de la conversion: ${errorData.error}`);
        }
      } else {
        alert("Aucun prospect sélectionné pour la conversion.");
      }
    } catch (error) {
      console.error("Erreur lors de la conversion du prospect en client:", error);
      alert("Une erreur s'est produite lors de la tentative de conversion du prospect en client.");
    }
  };


  

  const converitEnClient = async (prospect: Prospect) => {
    annulerEdition();
    setEnConversion(true);
    setNom(prospect.nom);
    setEmail(prospect.email);
    setInterets(prospect.interets.join(', '));
    setProspectEnCoursDeConversion(prospect);
  }
  
  const annulerConversion = () => {
    setEnConversion(false);
    setNom('');
    setEmail('');
    setEmail('');
    setInterets('');
  }

  let contenu;

  if (enEdition) {
    contenu = (
      <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Modifier Prospect</h3>
        <form onSubmit={soumettreModification} className="space-y-4">
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
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={annulerEdition}
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
    );
  } else if (enConversion) {
    contenu = (
      <div className="max-w-xl mx-auto">
    <h3 className="text-xl font-semibold text-red-600 mb-4">Merci de remplir les champs suivants pour {prospectEnCoursDeConversion ? prospectEnCoursDeConversion.nom : ''}.</h3>
    <form onSubmit={SubmitConversion} className="space-y-4">
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
          onClick={annulerConversion}
          className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-blue-600"
        >
           Ajouter et convertir en clients
        </button>
      </div>
    </form>
  </div> 
    );
  } else {
    contenu = (
      <div className="max-w-xl mx-auto">
        <h3 className="text-xl font-semibold mb-4">Ajouter un Prospect</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            type="text"
            autoFocus
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
          <button
            type="submit"
            className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Ajouter 
          </button>
        </form>
      </div>
    );
  }

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
          <strong className="font-bold">Erreur ! </strong>
          <span className="block sm:inline">{errorMessage}</span>
        </div>
    )}
    <h2 className="text-2xl font-bold text-center mb-6">Gestion des Prospects</h2>
    {contenu}

<h2 className="text-2xl font-bold text-center my-6">Liste des Prospects</h2>
    <div className="overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Nom
            </th>
            <th scope="col" className="px-6 py-3">
              Email
            </th>
            <th scope="col" className="px-6 py-3">
              Intérêts
            </th>
            <th scope="col" className="px-6 py-3">
              Statut
            </th>
            <th scope="col" className="px-6 py-3">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((prospect) => (
            <tr key={prospect._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <td className="px-6 py-4">{prospect.nom}</td>
              <td className="px-6 py-4">{prospect.email}</td>
              <td className="px-6 py-4">{prospect.interets.join(', ')}</td>
              <td className="px-6 py-4">{prospect.statut}</td>
              <td>
              {prospect.statut === "Prospect" ? ( 
              <>
                <button onClick={() => supprimerProspect(prospect._id)}
                  className="font-medium text-red-600 dark:text-red-500 hover:underline"
                >Supprimer</button>
                <button onClick={() => modifierProspect(prospect)}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:underline ml-2"
                >Modifier</button>
                  <button onClick={() => converitEnClient(prospect)}
                  className="font-medium text-600 dark:text-green-500 hover:underline ml-2"
                >Convertir en client</button>
              </>
                ) : '' }

              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default AddProspect;
