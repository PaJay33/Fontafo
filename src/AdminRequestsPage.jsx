import React, { useState, useEffect, useCallback } from 'react';
import { X, XCircle, CheckCircle, User, Eye, AlertCircle, Clock, Calendar, Mail, Phone, UserCircle, FileText, Search } from 'lucide-react';
import { API_URL } from './api';

// Page admin: Demandes d'adhésion améliorée
const AdminRequestsPage = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filter, setFilter] = useState('en_attente'); // en_attente, approuvé, refusé, tous
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/adhesion-requests/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setRequests(data.data);
      } else {
        setError('Erreur lors du chargement des demandes');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/adhesion-requests/${request._id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Demande approuvée ! Le membre peut maintenant se connecter.');
        loadRequests();
        setSelectedRequest(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors de l\'approbation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (request) => {
    setError('');
    setSuccess('');

    if (!window.confirm(`Êtes-vous sûr de vouloir refuser la demande de ${request.prenom} ${request.nom} ?`)) {
      return;
    }

    const raisonRefus = prompt('Raison du refus (optionnel):');

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/adhesion-requests/${request._id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ raisonRefus })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Demande refusée');
        loadRequests();
        setSelectedRequest(null);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Erreur lors du refus');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(r => 
    filter === 'tous' ? true : r.statut === filter
  );

  const pending = requests.filter(r => r.statut === 'en_attente');
  const approved = requests.filter(r => r.statut === 'approuvé');
  const rejected = requests.filter(r => r.statut === 'refusé');

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
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white">Demandes d'adhésion</h2>
              <p className="text-gray-400">Gérer les nouvelles demandes</p>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-black text-white">{requests.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-400 text-sm">En attente</p>
                <p className="text-2xl font-black text-white">{pending.length}</p>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm">Approuvées</p>
                <p className="text-2xl font-black text-white">{approved.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm">Refusées</p>
                <p className="text-2xl font-black text-white">{rejected.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-blue-800/30 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm font-semibold">Filtrer par :</span>
            <div className="flex space-x-2">
              <FilterButton 
                active={filter === 'en_attente'} 
                onClick={() => setFilter('en_attente')}
                icon={<Clock className="w-4 h-4" />}
                label="En attente"
                count={pending.length}
                color="amber"
              />
              <FilterButton 
                active={filter === 'approuvé'} 
                onClick={() => setFilter('approuvé')}
                icon={<CheckCircle className="w-4 h-4" />}
                label="Approuvées"
                count={approved.length}
                color="green"
              />
              <FilterButton 
                active={filter === 'refusé'} 
                onClick={() => setFilter('refusé')}
                icon={<XCircle className="w-4 h-4" />}
                label="Refusées"
                count={rejected.length}
                color="red"
              />
              <FilterButton 
                active={filter === 'tous'} 
                onClick={() => setFilter('tous')}
                icon={<FileText className="w-4 h-4" />}
                label="Toutes"
                count={requests.length}
                color="blue"
              />
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        {filteredRequests.length === 0 ? (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-blue-800/30 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
              {filter === 'en_attente' ? (
                <CheckCircle className="w-10 h-10 text-green-400" />
              ) : (
                <Search className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {filter === 'en_attente' 
                ? 'Aucune demande en attente' 
                : `Aucune demande ${filter === 'tous' ? '' : filter}e`}
            </h3>
            <p className="text-gray-400">
              {filter === 'en_attente' 
                ? 'Toutes les demandes ont été traitées' 
                : 'Aucune demande ne correspond à ce filtre'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onApprove={() => handleApprove(request)}
                onReject={() => handleReject(request)}
                onView={() => setSelectedRequest(request)}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Modal détails demande */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-blue-500/30 shadow-2xl animate-scaleIn">
              <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Détails de la demande</h3>
                      <p className="text-gray-400 text-sm">
                        Reçue le {new Date(selectedRequest.dateDemande).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <InfoCard icon={<User />} label="Nom complet" value={`${selectedRequest.prenom} ${selectedRequest.nom}`} color="blue" />
                  <InfoCard icon={<Mail />} label="Email" value={selectedRequest.email} color="purple" />
                  <InfoCard icon={<Phone />} label="Téléphone" value={selectedRequest.num} color="green" />
                  <InfoCard icon={<UserCircle />} label="Sexe" value={selectedRequest.sexe === 'Male' ? 'Homme' : 'Femme'} color="orange" />
                  <InfoCard icon={<Calendar />} label="Type cotisation" value={selectedRequest.cotisation === 'mensuel' ? 'Mensuelle (3000 XOF)' : 'Trimestrielle (9000 XOF)'} color="pink" />
                  <InfoCard 
                    icon={selectedRequest.statut === 'en_attente' ? <Clock /> : selectedRequest.statut === 'approuvé' ? <CheckCircle /> : <XCircle />} 
                    label="Statut" 
                    value={selectedRequest.statut === 'en_attente' ? 'En attente' : selectedRequest.statut === 'approuvé' ? 'Approuvée' : 'Refusée'} 
                    color={selectedRequest.statut === 'en_attente' ? 'amber' : selectedRequest.statut === 'approuvé' ? 'green' : 'red'} 
                  />
                </div>

                {selectedRequest.statut === 'en_attente' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Traitement...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Approuver</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Refuser</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant bouton de filtre
const FilterButton = ({ active, onClick, icon, label, count, color }) => {
  const colors = {
    amber: 'border-amber-500/50 text-amber-300 bg-amber-500/20',
    green: 'border-green-500/50 text-green-300 bg-green-500/20',
    red: 'border-red-500/50 text-red-300 bg-red-500/20',
    blue: 'border-blue-500/50 text-blue-300 bg-blue-500/20'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border transition-all font-semibold text-sm flex items-center space-x-2 ${
        active 
          ? `${colors[color]} scale-105` 
          : 'border-slate-700 text-gray-400 hover:border-slate-600 hover:text-gray-300'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? 'bg-white/20' : 'bg-slate-800'
      }`}>
        {count}
      </span>
    </button>
  );
};

// Composant carte de demande
const RequestCard = ({ request, onApprove, onReject, onView, loading }) => {
  const statusConfig = {
    'en_attente': {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-300',
      label: 'En attente'
    },
    'approuvé': {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-300',
      label: 'Approuvée'
    },
    'refusé': {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-300',
      label: 'Refusée'
    }
  };

  const status = statusConfig[request.statut];

  return (
    <div className="group relative bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-800/30 hover:border-blue-500/50 transition-all transform hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <span className={`px-3 py-1 ${status.bg} border ${status.border} ${status.text} text-xs font-bold rounded-full`}>
          {status.label}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-1">
        {request.prenom} {request.nom}
      </h3>
      <p className="text-gray-400 text-sm mb-1 flex items-center space-x-1">
        <Mail className="w-3 h-3" />
        <span>{request.email}</span>
      </p>
      <p className="text-gray-500 text-sm mb-4 flex items-center space-x-1">
        <Phone className="w-3 h-3" />
        <span>{request.num}</span>
      </p>

      <div className="flex items-center space-x-2 mb-4">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full font-medium">
          {request.cotisation === 'mensuel' ? 'Mensuelle' : 'Trimestrielle'}
        </span>
        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full font-medium">
          {request.sexe === 'Male' ? 'Homme' : 'Femme'}
        </span>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onView}
          className="flex-1 px-3 py-2 bg-slate-800 text-gray-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-semibold flex items-center justify-center space-x-1"
        >
          <Eye className="w-4 h-4" />
          <span>Détails</span>
        </button>
        {request.statut === 'en_attente' && (
          <>
            <button
              onClick={onApprove}
              disabled={loading}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              title="Approuver"
            >
              <CheckCircle className="w-5 h-5" />
            </button>
            <button
              onClick={onReject}
              disabled={loading}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              title="Refuser"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Animations CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  .animate-scaleIn {
    animation: scaleIn 0.3s ease-out;
  }
`;
document.head.appendChild(animationStyle);

export { AdminRequestsPage, RequestCard, FilterButton };

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

export default AdminRequestsPage
