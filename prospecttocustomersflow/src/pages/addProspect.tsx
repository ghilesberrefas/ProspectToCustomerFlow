import React from 'react';
import { useState, FormEvent, useEffect } from 'react';

// Définis une interface pour le prospect
interface Prospect {
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
  const [enEdition, setEnEdition] = useState<boolean>(false);

  // État pour stocker la liste des prospects
  const [prospects, setProspects] =  useState<Prospect[]>([]);
  const [prospectEnCoursDeModification, setProspectEnCoursDeModification] = useState<Prospect | null>(null);
  // Utilise useEffect pour charger la liste des prospects lors du chargement de la page
  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const response = await fetch('/api/prospects');
        if (response.ok) {
          const data = await response.json();
          setProspects(data);
        } else {
          // Gérer l'erreur de récupération des prospects ici
        }
      } catch (error) {
        // Gérer l'erreur ici
      }
    };

    fetchProspects();
  }, []); // Le tableau vide signifie que cela se produit une seule fois lors du chargement initial

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const body = { 
        nom, 
        email, 
        interets: interets.split(',').map(interet => interet.trim()), // Transforme la chaîne en tableau
        statut,
      };
      const response = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // Réinitialiser les champs du formulaire après l'ajout réussi
        setNom('');
        setEmail('');
        setInterets('');
        setStatut('Prospect');
        alert('Prospect ajouté avec succès.');
      } else {
        // Afficher un message d'erreur si l'ajout échoue
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Erreur lors de l'envoi: ${error.message}`);
    }
  };

  const supprimerProspect = async (prospectId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      try {
        const response = await fetch(`/api/prospects/${prospectId}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          // La suppression s'est bien déroulée côté serveur, maintenant met à jour l'état client
          const updatedProspects = prospects.filter((prospect) => prospect._id !== prospectId);
          setProspects(updatedProspects);
          alert('Prospect supprimé avec succès.');
        } else {
          // Gérer le cas où la suppression échoue côté serveur
          const errorData = await response.json();
          alert(`Erreur lors de la suppression : ${errorData.error}`);
        }
      } catch (error: any) {
        // Gérer les erreurs de réseau ou autres erreurs inattendues
        console.error(`Erreur lors de la suppression : ${error.message}`);
        alert('Une erreur s\'est produite lors de la suppression du prospect.');
      }
    }
  };
  
  const modifierProspect = async (prospect: Prospect) => {
    // Tu peux utiliser un état local pour stocker les données du prospect à modifier
    setEnEdition(true);
    setNom(prospect.nom);
    setEmail(prospect.email);
    setInterets(prospect.interets.join(', '));
    setStatut(prospect.statut as 'Prospect' | 'Client');
    setProspectEnCoursDeModification(prospect);
    // Tu peux afficher un formulaire de modification avec un bouton de soumission ici
  };

  // Ensuite, tu peux ajouter une logique pour soumettre les modifications lorsque l'utilisateur clique sur un bouton de mise à jour
  const soumettreModification = async () => {
    try {
      if (prospectEnCoursDeModification) {
        const body = { 
          nom, 
          email, 
          interets: interets.split(',').map(interet => interet.trim()), 
          statut,
        };
        const response = await fetch(`/api/prospects/${prospectEnCoursDeModification._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
  
        if (response.ok) {
          // La mise à jour s'est bien déroulée côté serveur, maintenant actualise l'état client si nécessaire
          alert('Prospect mis à jour avec succès.');
        } else {
          // Gérer le cas où la mise à jour échoue côté serveur
          const errorData = await response.json();
          alert(`Erreur lors de la mise à jour : ${errorData.error}`);
        }
      } else {
        alert('Aucun prospect en cours de modification.');
      }
    } catch (error: any) {
      // Gérer les erreurs de réseau ou autres erreurs inattendues
      console.error(`Erreur lors de la mise à jour : ${error.message}`);
      alert('Une erreur s\'est produite lors de la mise à jour du prospect.');
    }
  };
    
  const annulerEdition = () => {
    // Désactive le mode d'édition et réinitialise le formulaire
    setEnEdition(false);
    setNom('');
    setEmail('');
    setInterets('');
    setStatut('Prospect');
  };
  

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des Prospects</h2>
      {enEdition ? ( // Affiche le formulaire de modification en mode d'édition
        <div>
          <h2>Modifier Prospect</h2>
          <form onSubmit={soumettreModification}>
          <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={interets}
          onChange={(e) => setInterets(e.target.value)}
          placeholder="Intérêts (séparés par des virgules)"
        />
        <select value={statut} onChange={(e) => setStatut(e.target.value as 'Prospect' | 'Client')}>
          <option value="Prospect">Prospect</option>
          <option value="Client">Client</option>
        </select>
            <button type="button" onClick={annulerEdition}>Annuler</button>
            <button type="submit">Enregistrer les modifications</button>
          </form>
        </div>
      ) : (
        <div>
          <h2>Ajouter Prospect</h2>
          <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={interets}
          onChange={(e) => setInterets(e.target.value)}
          placeholder="Intérêts (séparés par des virgules)"
        />
        <select value={statut} onChange={(e) => setStatut(e.target.value as 'Prospect' | 'Client')}>
          <option value="Prospect">Prospect</option>
          <option value="Client">Client</option>
        </select>
        <button type="submit">Ajouter Prospect</button>
          </form>
        </div>
      )}

      <h2>Liste des Prospects</h2>
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Intérêts</th>
            <th>Statut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {prospects.map((prospect) => (
            <tr key={prospect._id}>
              <td>{prospect.nom}</td>
              <td>{prospect.email}</td>
              <td>{prospect.interets.join(', ')}</td>
              <td>{prospect.statut}</td>
              <td>
                {/* Bouton de suppression */}
                <button onClick={() => supprimerProspect(prospect._id)}>Supprimer</button>
                {/* Bouton de mise à jour */}
                <button onClick={() => modifierProspect(prospect)}>Modifier</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddProspect;
