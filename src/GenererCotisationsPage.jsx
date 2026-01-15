
import React, { useState, useEffect } from 'react';
import { Zap, Users, User, CreditCard, CheckCircle, XCircle, AlertCircle, ChevronRight, DollarSign, Calendar, PlusCircle, Mail, Square, CheckSquare, Search  } from 'lucide-react';
import { API_URL } from './api';

// GenererCotisationsPage avec sélection de membres
const GenererCotisationsPage = ({ token, setCurrentPage }) => {
  const [formData, setFormData] = useState({
    mois: new Date().toISOString().slice(0, 7),
    montant: 3000
  });
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [result, setResult] = useState(null);

  // Charger les membres au montage
  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMembers = async () => {
    try {
      const response = await fetch(`${API_URL}/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        // Filtrer pour garder seulement les membres actifs
        const activeMembers = data.data.filter(m => 
          m.role !== 'Admin' && m.statu === 'actif'
        );
        setMembers(activeMembers);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Filtrer les membres selon la recherche
  const filteredMembers = members.filter(member =>
    searchTerm === '' ||
    member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Toggle sélection d'un membre
  const toggleMember = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Toggle sélection de tous
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m._id));
    }
    setSelectAll(!selectAll);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedMembers.length === 0) {
      alert('⚠️ Veuillez sélectionner au moins un membre');
      return;
    }

    setLoading(true);
    setResult(null);

    console.log('📤 Génération sélective:', {
      mois: formData.mois,
      montant: formData.montant,
      userIds: selectedMembers
    });

    try {
      const response = await fetch(`${API_URL}/cotisations/generer-selective`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mois: formData.mois,
          montant: formData.montant,
          userIds: selectedMembers
        })
      });

      const data = await response.json();
      console.log('📥 Réponse:', data);

      if (data.success) {
        setResult({
          success: true,
          message: data.message,
          stats: data.stats,
          existantes: data.existantes,
          errors: data.errors
        });
        
        // Réinitialiser la sélection
        setSelectedMembers([]);
        setSelectAll(false);
      } else {
        setResult({
          success: false,
          message: data.message || 'Erreur lors de la génération'
        });
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      setResult({
        success: false,
        message: 'Erreur de connexion au serveur'
      });
    } finally {
      setLoading(false);
    }
  };

  // Formater le mois
  const getFormattedMonth = () => {
    if (!formData.mois) return '';
    const date = new Date(formData.mois + '-01');
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="min-h-screen py-16 px-4 relative overflow-hidden">
      {/* Arrière-plan animé */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-blue-400/50">
                <PlusCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Générer les Cotisations
          </h2>
          <p className="text-gray-400 text-lg">
            Sélectionnez les membres pour lesquels créer les cotisations
          </p>
        </div>

        {/* Formulaire principal */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-800/30 shadow-2xl shadow-blue-500/10">
          {/* Résultat */}
          {result && (
            <div className={`mb-6 rounded-xl p-5 border animate-scaleIn ${
              result.success 
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  result.success ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold text-lg mb-1 ${
                    result.success ? 'text-green-300' : 'text-red-300'
                  }`}>
                    {result.success ? 'Génération réussie !' : 'Erreur'}
                  </p>
                  <p className={result.success ? 'text-green-200' : 'text-red-200'}>
                    {result.message}
                  </p>
                  
                  {/* Statistiques détaillées */}
                  {result.success && result.stats && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-green-500/20 rounded-lg p-3">
                        <p className="text-green-300 text-xs">Créées</p>
                        <p className="text-green-100 font-bold text-2xl">{result.stats.creees}</p>
                      </div>
                      <div className="bg-amber-500/20 rounded-lg p-3">
                        <p className="text-amber-300 text-xs">Existantes</p>
                        <p className="text-amber-100 font-bold text-2xl">{result.stats.existantes}</p>
                      </div>
                      <div className="bg-red-500/20 rounded-lg p-3">
                        <p className="text-red-300 text-xs">Erreurs</p>
                        <p className="text-red-100 font-bold text-2xl">{result.stats.erreurs}</p>
                      </div>
                      <div className="bg-blue-500/20 rounded-lg p-3">
                        <p className="text-blue-300 text-xs">Total</p>
                        <p className="text-blue-100 font-bold text-2xl">{result.stats.total}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Détails des cotisations existantes */}
                  {result.existantes && result.existantes.length > 0 && (
                    <div className="mt-3 bg-amber-500/10 rounded-lg p-3">
                      <p className="text-amber-300 font-semibold text-sm mb-2">
                        ⚠️ Cotisations déjà existantes :
                      </p>
                      <ul className="text-amber-200/80 text-xs space-y-1">
                        {result.existantes.map((ex, idx) => (
                          <li key={idx}>• {ex.nom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Erreurs */}
                  {result.errors && result.errors.length > 0 && (
                    <div className="mt-3 bg-red-500/10 rounded-lg p-3">
                      <p className="text-red-300 font-semibold text-sm mb-2">
                        ❌ Erreurs rencontrées :
                      </p>
                      <ul className="text-red-200/80 text-xs space-y-1">
                        {result.errors.map((err, idx) => (
                          <li key={idx}>• {err.nom}: {err.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Configuration de base */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Mois */}
              <div className="space-y-2">
                <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>Mois de génération</span>
                </label>
                <input
                  type="month"
                  value={formData.mois}
                  onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                />
                {formData.mois && (
                  <p className="text-blue-400 text-sm flex items-center space-x-1">
                    <span>📅</span>
                    <span className="capitalize">{getFormattedMonth()}</span>
                  </p>
                )}
              </div>

              {/* Montant */}
              <div className="space-y-2">
                <label className="block text-white font-semibold text-sm flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span>Montant</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.montant}
                    onChange={(e) => setFormData({ ...formData, montant: parseInt(e.target.value) })}
                    required
                    className="w-full px-4 py-3 bg-slate-800/50 text-white rounded-xl border border-blue-800/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    XOF
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  Montant: <span className="font-bold text-green-400">{formData.montant.toLocaleString()} XOF</span>
                </p>
              </div>
            </div>

            {/* Section sélection des membres */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-white font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span>Sélectionner les membres</span>
                  <span className="text-gray-500 text-sm">
                    ({selectedMembers.length}/{filteredMembers.length})
                  </span>
                </label>
                
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors text-sm font-semibold flex items-center space-x-2"
                >
                  {selectAll ? (
                    <>
                      <CheckSquare className="w-4 h-4" />
                      <span>Tout désélectionner</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4" />
                      <span>Tout sélectionner</span>
                    </>
                  )}
                </button>
              </div>

              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                />
              </div>

              {/* Liste des membres */}
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-3">
                    <div className="w-6 h-6 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <span className="text-gray-400">Chargement des membres...</span>
                  </div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8 bg-slate-800/30 rounded-xl">
                  <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Aucun membre trouvé</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto bg-slate-800/30 rounded-xl p-4 space-y-2">
                  {filteredMembers.map((member) => (
                    <label
                      key={member._id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedMembers.includes(member._id)
                          ? 'bg-purple-500/20 border border-purple-500/40'
                          : 'bg-slate-800/50 hover:bg-slate-700/50 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member._id)}
                        onChange={() => toggleMember(member._id)}
                        className="w-5 h-5 text-purple-500 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-semibold">{member.prenom} {member.nom}</p>
                          <div className="flex items-center space-x-3 text-xs text-gray-400">
                            <span className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{member.email}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              member.cotisation === 'mensuel'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {member.cotisation === 'mensuel' ? 'Mensuel' : 'Trimestriel'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Note importante */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-300 font-semibold text-sm">Important</p>
                  <p className="text-amber-200/90 text-sm mt-1">
                    Les cotisations seront créées uniquement pour les membres sélectionnés ci-dessus.
                    Si une cotisation existe déjà pour un membre, elle sera ignorée.
                  </p>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setCurrentPage('cotisations')}
                className="flex-1 px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors border border-slate-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || selectedMembers.length === 0}
                className="relative flex-1 group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-disabled:opacity-50"></div>
                
                <div className="relative w-full px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      <span>Générer pour {selectedMembers.length} membre(s)</span>
                    </>
                  )}
                  
                  {!loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Lien vers les cotisations */}
          {result?.success && (
            <div className="mt-6 pt-6 border-t border-slate-700 text-center">
              <button
                onClick={() => setCurrentPage('cotisations')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-xl transition-all font-semibold"
              >
                <CreditCard className="w-5 h-5" />
                <span>Voir les cotisations générées</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenererCotisationsPage
