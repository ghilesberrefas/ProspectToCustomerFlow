import React, { useState, useEffect, FormEvent } from 'react';
import { Prospect } from './addProspect';

interface Interaction {
  _id: string;
  type: 'Email' | 'Appel' | 'Réunion' | 'Autre';
  date: string;
  notes: string;
  prospectId: string; 
}

const Interactions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [type, setType] = useState<string>('Email');
  const [date, setDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [prospectId, setProspectId] = useState<string>('')
  const [prospects, setProspects] =  useState<Prospect[]>([]);
  const [enEdition, setEnEdition] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [interactionsEnCoursDeModification, setInteractionsEnCoursDeModification] = useState<Interaction | null>(null);
  
  useEffect(() => {
    const fetchInteractions = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/interactions');
        const data = await response.json();
        setInteractions(data);
      } catch (error) {
        console.error('Erreur lors du chargement des interactions', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProspects = async () => {
        setLoading(true);
        try {
          const response = await fetch('/api/prospects');
          if (!response.ok) {
            throw new Error('Problème lors de la récupération des prospects');
          }
          const data = await response.json();
          setProspects(data);
        } catch (error) {
          console.error("Erreur lors du chargement des prospects:", error);
        } finally {
            setLoading(false);
        }
      };

    fetchProspects();
    fetchInteractions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, date, notes, prospectId }),
      });
      if (response.ok) {
        const newInteraction = await response.json();
        setInteractions([...interactions, newInteraction]);
        setType('');
        setDate('');
        setNotes('');
        setProspectId('');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'interaction', error);
    }
  };

  const deleteInteraction = async (interactionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette interaction?')) {
      try {
          const response = await fetch(`/api/interactions?id=${interactionId}`, {
            method: 'DELETE',
          });
      
          if (response.ok) {
            setInteractions(interactions.filter((interaction) => interaction._id !== interactionId));
          } else {
            throw new Error('La suppression de l\'interaction a échoué');
          }
        } catch (error) {
          console.error('Erreur lors de la suppression de l\'interaction:', error);
          alert('Erreur lors de la suppression de l\'interaction. Veuillez réessayer.');
        }
    }
  }

  const formatDate = (dateString : string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (`0${date.getMonth() + 1}`).slice(-2); // Add a zero in front for months 1 to 9
    const day = (`0${date.getDate()}`).slice(-2); // Add a zero in front for months 1 to 9
    return `${year}-${month}-${day}`;
  };

  const submitEditInteraction = async (e: FormEvent) => {
    e.preventDefault();
  
    try {
      if (interactionsEnCoursDeModification) {
        const body = {
          type,
          date,
          notes,
          prospectId,
        };
    
        const response = await fetch(`/api/interactions?id=${interactionsEnCoursDeModification._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
    
        if (response.ok) {
          const updatedInteraction = await response.json();
          setInteractions(interactions.map((interaction) =>
            interaction._id === updatedInteraction._id ? updatedInteraction : interaction
          ));
          setEnEdition(false);
          resetForm();
        } else {
          const errorData = await response.json();
          console.error('Erreur lors de la modification de l\'interaction', errorData);
        }
      }else {
        alert("Aucun Interaction sélectionné pour la modification.");
      }
      
    } catch (error) {
      console.error('Erreur lors de la modification de l\'interaction', error);
    }
  };
  
  const resetForm = () => {
    setType('Email');
    setDate('');
    setNotes('');
    setProspectId('');
    setEnEdition(false);
    setInteractionsEnCoursDeModification(null);
  };

  const updateInteraction = async (interaction: Interaction) => {
    setEnEdition(true);
    setProspectId(interaction.prospectId); 
    setType(interaction.type);
    setDate(formatDate(interaction.date)); 
    setNotes(interaction.notes);
    setInteractionsEnCoursDeModification(interaction);
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
        <h1 className="text-3xl font-bold text-center mb-8">Gestion des Interactions</h1>
        {enEdition ? (<div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <form onSubmit={submitEditInteraction} className="space-y-6">
                <div>
                    <label htmlFor="prospectId" className="block text-sm font-medium text-gray-700">Prospect</label>
                    <select
                        id="prospectId"
                        value={prospectId}
                        onChange={(e) => setProspectId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    >
                        <option value="">Sélectionnez un prospect</option>
                        {prospects.map((prospect) => (
                        <option key={prospect._id} value={prospect._id}>
                            {prospect.nom}
                        </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="interactionType" className="block text-sm font-medium text-gray-700">Type d&apos;interaction</label>
                    <select id="interactionType" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="Email">Email</option>
                    <option value="Appel">Appel</option>
                    <option value="Réunion">Réunion</option>
                    <option value="Autre">Autre</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="interactionDate" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="interactionDate" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="interactionNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea id="interactionNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>

                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Modifier
                </button>
            </form>
        </div>) : (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="prospectId" className="block text-sm font-medium text-gray-700">Prospect</label>
                    <select
                        id="prospectId"
                        value={prospectId}
                        onChange={(e) => setProspectId(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                    >
                        <option value="">Sélectionnez un prospect</option>
                        {prospects.map((prospect) => (
                        <option key={prospect._id} value={prospect._id}>
                            {prospect.nom}
                        </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="interactionType" className="block text-sm font-medium text-gray-700">Type d&apos;interaction</label>
                    <select id="interactionType" value={type} onChange={(e) => setType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="Email">Email</option>
                    <option value="Appel">Appel</option>
                    <option value="Réunion">Réunion</option>
                    <option value="Autre">Autre</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="interactionDate" className="block text-sm font-medium text-gray-700">Date</label>
                    <input type="date" id="interactionDate" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>

                <div>
                    <label htmlFor="interactionNotes" className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea id="interactionNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"></textarea>
                </div>

                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Ajouter Interaction
                </button>
            </form>
        </div>
        )} 
      <h2 className="text-2xl font-bold text-center my-6">Liste des Interactions</h2>
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="py-3 px-6">Prospect</th>
                <th scope="col" className="py-3 px-6">Type</th>
                <th scope="col" className="py-3 px-6">Date</th>
                <th scope="col" className="py-3 px-6">Notes</th>
                <th scope="col" className="py-3 px-6">Action</th>
            </tr>
            </thead>
            <tbody>
              {interactions.map((interaction) => {
                const prospectNom = prospects.find(p => p._id.toString() === interaction.prospectId?.toString())?.nom;                
                return (
                  <tr key={interaction._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">{prospectNom ?? 'Nom non trouvé'}</td>
                    <td className="px-6 py-4">{interaction.type}</td>
                    <td className="px-6 py-4">{interaction.date}</td>
                    <td className="px-6 py-4">{interaction.notes}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteInteraction(interaction._id)}
                              className="font-medium text-red-600 dark:text-red-500 hover:underline">Supprimer</button>
                      <button onClick={() => updateInteraction(interaction)}
                              className="font-medium text-blue-600 dark:text-blue-500 hover:underline ml-2">Modifier</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

        </table>
      </div>
    </div>
  );
};

export default Interactions;
