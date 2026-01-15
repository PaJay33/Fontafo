import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Users, Zap, Shield, X, User, CreditCard, Trash2, Eye, Mail, UserCircle, Phone, UserCheck, UserX, Ban, AlertTriangle, Search, CheckCircle, XCircle, Plus, Lock } from 'lucide-react';
import { API_URL } from './api';

// Page admin: Gestion des membres améliorée
const AdminMembersPage = ({ token }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  // État pour le formulaire d'ajout
  const [newMember, setNewMember] = useState({
    nom: '',
    prenom: '',
    email: '',
    num: '',
    sexe: 'Male',
    mdp: '',
    confirmMdp: '',
    role: 'membre',
    cotisation: 'mensuel',
    statu: 'actif'
  });

  const fetchMembers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMembers(data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleChangeStatus = async (memberId, newStatus) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/users/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statu: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Statut changé en "${newStatus}" avec succès`);
        fetchMembers();
        setSelectedMember(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Gérer les erreurs de validation du backend
        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          if (typeof data.error === 'object' && data.error.errors) {
            const errorMessages = Object.values(data.error.errors)
              .map(err => err.message)
              .join(', ');
            setError(errorMessages || 'Erreur de validation');
          } else if (typeof data.error === 'string') {
            setError(data.error);
          } else {
            setError('Erreur lors de la modification');
          }
        } else {
          setError('Erreur lors de la modification');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setSuccess('✅ Membre supprimé avec succès');
        setMembers(members.filter(m => m._id !== id));
        setShowDeleteConfirm(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation des mots de passe
    if (newMember.mdp !== newMember.confirmMdp) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newMember.mdp.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    try {
      const memberData = {
        nom: newMember.nom,
        prenom: newMember.prenom,
        email: newMember.email,
        num: newMember.num,
        sexe: newMember.sexe,
        mdp: newMember.mdp,
        role: newMember.role,
        cotisation: newMember.cotisation,
        statu: newMember.statu
      };

      console.log('Envoi des données:', memberData);
      console.log('URL:', `${API_URL}/users/ajouter`);

      const response = await fetch(`${API_URL}/users/ajouter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(memberData)
      });

      console.log('Réponse status:', response.status);
      const data = await response.json();
      console.log('Réponse data:', data);

      if (data.success) {
        setSuccess('✅ Membre ajouté avec succès');
        fetchMembers();
        setShowAddMemberModal(false);
        // Réinitialiser le formulaire
        setNewMember({
          nom: '',
          prenom: '',
          email: '',
          num: '',
          sexe: 'Male',
          mdp: '',
          confirmMdp: '',
          role: 'membre',
          cotisation: 'mensuel',
          statu: 'actif'
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Afficher tous les détails de l'erreur
        console.error('Erreur complète:', data);

        if (data.message) {
          setError(data.message);
        } else if (data.error) {
          if (typeof data.error === 'object' && data.error.errors) {
            const errorMessages = Object.values(data.error.errors)
              .map(err => err.message)
              .join(', ');
            setError(errorMessages || 'Erreur de validation');
          } else if (typeof data.error === 'string') {
            setError(data.error);
          } else {
            setError(JSON.stringify(data.error));
          }
        } else {
          setError('Erreur lors de l\'ajout du membre: ' + JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('Erreur catch:', error);
      setError('Erreur de connexion au serveur: ' + error.message);
    }
  };

  // Filtrer les membres
  const filteredMembers = members.filter(member => {
    const matchSearch = searchTerm === '' || 
      member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filterStatus === 'tous' || member.statu === filterStatus;
    
    return matchSearch && matchStatus;
  });

  const activeCount = members.filter(m => m.statu === 'actif').length;
  const suspendedCount = members.filter(m => m.statu === 'suspendu').length;
  const bannedCount = members.filter(m => m.statu === 'bani').length;

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3 animate-shake">
            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-400 font-semibold text-sm">Erreur</p>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-semibold text-sm">Succès</p>
              <p className="text-green-300/80 text-sm mt-1">{success}</p>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-white">Gestion des membres</h2>
                <p className="text-gray-400">{members.length} membre(s) au total</p>
              </div>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:scale-105 transition-transform font-bold flex items-center space-x-2 shadow-lg shadow-green-500/50"
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter un membre</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total</p>
                  <p className="text-2xl font-black text-white">{members.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm">Actifs</p>
                  <p className="text-2xl font-black text-white">{activeCount}</p>
                </div>
                <UserCheck className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-400 text-sm">Suspendus</p>
                  <p className="text-2xl font-black text-white">{suspendedCount}</p>
                </div>
                <UserX className="w-8 h-8 text-amber-400" />
              </div>
            </div>
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-400 text-sm">Bannis</p>
                  <p className="text-2xl font-black text-white">{bannedCount}</p>
                </div>
                <Ban className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Barre de recherche et filtres */}
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Filtres de statut */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterStatus('tous')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'tous'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Tous
                </button>
                <button
                  onClick={() => setFilterStatus('actif')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'actif'
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Actifs
                </button>
                <button
                  onClick={() => setFilterStatus('suspendu')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'suspendu'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Suspendus
                </button>
                <button
                  onClick={() => setFilterStatus('bani')}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    filterStatus === 'bani'
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Bannis
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des membres */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-gray-400">Chargement des membres...</span>
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-blue-800/30 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Aucun membre trouvé</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Aucun résultat pour votre recherche' : 'Aucun membre ne correspond à ce filtre'}
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-800/30">
                    <th className="text-left text-gray-400 py-3 px-4 font-semibold">Membre</th>
                    <th className="text-left text-gray-400 py-3 px-4 font-semibold">Contact</th>
                    <th className="text-left text-gray-400 py-3 px-4 font-semibold">Rôle</th>
                    <th className="text-left text-gray-400 py-3 px-4 font-semibold">Statut</th>
                    <th className="text-left text-gray-400 py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr key={member._id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{member.prenom} {member.nom}</p>
                            <p className="text-gray-500 text-xs">{member.sexe === 'Male' ? 'Homme' : 'Femme'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-300 text-sm flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </p>
                          <p className="text-gray-500 text-sm flex items-center space-x-1 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{member.num}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          member.role === 'Admin' 
                            ? 'bg-purple-500/20 text-purple-300' 
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          member.statu === 'actif' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          member.statu === 'suspendu' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {member.statu}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-all"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {member.statu === 'actif' && (
                            <button
                              onClick={() => handleChangeStatus(member._id, 'suspendu')}
                              className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all"
                              title="Suspendre"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}
                          {member.statu === 'suspendu' && (
                            <button
                              onClick={() => handleChangeStatus(member._id, 'actif')}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all"
                              title="Activer"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleChangeStatus(member._id, 'bani')}
                            className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-all"
                            title="Bannir"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(member._id)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl animate-scaleIn">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Confirmer la suppression</h3>
              </div>
              <p className="text-gray-300 mb-6">
                Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est <span className="text-red-400 font-bold">irréversible</span>.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal d'ajout de membre */}
        {showAddMemberModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto animate-fadeIn">
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="bg-slate-900 rounded-3xl max-w-3xl w-full my-8 border border-green-500/30 shadow-2xl animate-scaleIn">
              <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Ajouter un nouveau membre</h3>
                      <p className="text-gray-400 text-sm">Remplissez les informations du membre</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMemberModal(false)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddMember} className="p-6">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Nom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMember.nom}
                      onChange={(e) => setNewMember({ ...newMember, nom: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="Diop"
                    />
                  </div>

                  {/* Prénom */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Prénom <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newMember.prenom}
                      onChange={(e) => setNewMember({ ...newMember, prenom: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="Moussa"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newMember.email}
                      onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="exemple@email.com"
                    />
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Téléphone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={newMember.num}
                      onChange={(e) => setNewMember({ ...newMember, num: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="771234567"
                    />
                  </div>

                  {/* Sexe */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Sexe <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newMember.sexe}
                      onChange={(e) => setNewMember({ ...newMember, sexe: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    >
                      <option value="Male">Homme</option>
                      <option value="Female">Femme</option>
                    </select>
                  </div>

                  {/* Rôle */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Rôle <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newMember.role}
                      onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    >
                      <option value="membre">Membre</option>
                      <option value="bureau">Bureau</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  {/* Type de cotisation */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Type de cotisation <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newMember.cotisation}
                      onChange={(e) => setNewMember({ ...newMember, cotisation: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    >
                      <option value="mensuel">Mensuel (3000 FCFA)</option>
                      <option value="trimestriel">Trimestriel (9000 FCFA)</option>
                    </select>
                  </div>

                  {/* Statut */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2">
                      Statut <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={newMember.statu}
                      onChange={(e) => setNewMember({ ...newMember, statu: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                    >
                      <option value="actif">Actif</option>
                      <option value="suspendu">Suspendu</option>
                      <option value="bani">Banni</option>
                    </select>
                  </div>

                  {/* Mot de passe */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Mot de passe <span className="text-red-400">*</span></span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newMember.mdp}
                      onChange={(e) => setNewMember({ ...newMember, mdp: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="Minimum 8 caractères"
                      minLength="8"
                    />
                  </div>

                  {/* Confirmation mot de passe */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-2 flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Confirmer mot de passe <span className="text-red-400">*</span></span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newMember.confirmMdp}
                      onChange={(e) => setNewMember({ ...newMember, confirmMdp: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                      placeholder="Répétez le mot de passe"
                      minLength="8"
                    />
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex space-x-4 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-semibold"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold shadow-lg shadow-green-500/30"
                  >
                    Ajouter le membre
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal détails du membre */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-500/30 shadow-2xl animate-scaleIn">
              <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Détails du membre</h3>
                      <p className="text-gray-400 text-sm">{selectedMember.prenom} {selectedMember.nom}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <InfoCard icon={<User />} label="Nom" value={selectedMember.nom} color="blue" />
                  <InfoCard icon={<User />} label="Prénom" value={selectedMember.prenom} color="purple" />
                  <InfoCard icon={<Mail />} label="Email" value={selectedMember.email} color="green" />
                  <InfoCard icon={<Phone />} label="Téléphone" value={selectedMember.num} color="orange" />
                  <InfoCard icon={<UserCircle />} label="Sexe" value={selectedMember.sexe === 'Male' ? 'Homme' : 'Femme'} color="pink" />
                  <InfoCard icon={<Shield />} label="Rôle" value={selectedMember.role} color="indigo" />
                  <InfoCard icon={<Activity />} label="Statut" value={selectedMember.statu} color={selectedMember.statu === 'actif' ? 'green' : selectedMember.statu === 'suspendu' ? 'amber' : 'red'} />
                  <InfoCard icon={<CreditCard />} label="Cotisation" value={selectedMember.cotisation === 'mensuel' ? 'Mensuelle' : 'Trimestrielle'} color="cyan" />
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Actions rapides</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.statu === 'actif' && (
                      <button
                        onClick={() => handleChangeStatus(selectedMember._id, 'suspendu')}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold flex items-center space-x-2"
                      >
                        <UserX className="w-4 h-4" />
                        <span>Suspendre</span>
                      </button>
                    )}
                    {selectedMember.statu === 'suspendu' && (
                      <button
                        onClick={() => handleChangeStatus(selectedMember._id, 'actif')}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold flex items-center space-x-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Activer</span>
                      </button>
                    )}
                    {selectedMember.statu !== 'bani' && (
                      <button
                        onClick={() => handleChangeStatus(selectedMember._id, 'bani')}
                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold flex items-center space-x-2"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Bannir</span>
                      </button>
                    )}
                    {selectedMember.statu === 'bani' && (
                      <button
                        onClick={() => handleChangeStatus(selectedMember._id, 'actif')}
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:scale-105 transition-transform font-semibold flex items-center space-x-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Débannir</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const InfoCard = ({ title, value, icon }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-xl shadow-md flex items-center space-x-4">
      {icon && <div className="text-blue-400">{icon}</div>}
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-white font-bold text-lg">{value}</p>
      </div>
    </div>
  );
};

export default AdminMembersPage
